package com.vibraguard.blockchain.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.EthGasPrice;
import org.web3j.protocol.core.methods.response.EthGetCode;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.response.PollingTransactionReceiptProcessor;
import org.web3j.tx.response.TransactionReceiptProcessor;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.math.BigInteger;
import java.util.Collections;
import java.util.List;

@Service
public class BlockchainReportService {

    private static final List<String> KNOWN_HARDHAT_ADDRESSES = List.of(
            "0x5FbDB2315678afecb367f032d93F642f64180aa3",
            "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
            "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
    );

    @Value("${blockchain.rpc.url:http://localhost:8545}")
    private String blockchainRpcUrl;

    @Value("${blockchain.chain-id:31337}")
    private long chainId;

    @Value("${blockchain.gas-limit:500000}")
    private BigInteger gasLimit;

    @Value("${blockchain.workorder-registry.address:}")
    private String contractAddress;

    @Value("${blockchain.account.private-key:}")
    private String privateKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String storeReportCid(String reportId, String ipfsCid) throws Exception {
        if (reportId == null || reportId.isBlank()) {
            throw new IllegalArgumentException("Report ID is required");
        }
        if (ipfsCid == null || ipfsCid.isBlank()) {
            throw new IllegalArgumentException("IPFS CID is required");
        }
        if (privateKey == null || privateKey.isBlank()) {
            throw new IllegalStateException("Blockchain private key is not configured");
        }

        Web3j web3j = Web3j.build(new HttpService(blockchainRpcUrl));
        try {
            String resolvedContractAddress = resolveContractAddress(web3j);
            if (resolvedContractAddress == null || resolvedContractAddress.isBlank()) {
                throw new IllegalStateException("Blockchain contract address is not configured");
            }

            Credentials credentials = Credentials.create(privateKey);
            TransactionManager transactionManager = new RawTransactionManager(web3j, credentials, chainId);

            Function function = new Function(
                    "storeReport",
                    List.of(new Utf8String(reportId), new Utf8String(ipfsCid)),
                    Collections.emptyList()
            );

            String encodedFunction = FunctionEncoder.encode(function);
            EthGasPrice gasPriceResponse = web3j.ethGasPrice().send();
            if (gasPriceResponse.hasError()) {
                throw new IllegalStateException("Unable to read gas price: " + gasPriceResponse.getError().getMessage());
            }

            EthSendTransaction txResponse = transactionManager.sendTransaction(
                    gasPriceResponse.getGasPrice(),
                    gasLimit,
                    resolvedContractAddress,
                    encodedFunction,
                    BigInteger.ZERO
            );

            if (txResponse.hasError()) {
                throw new IllegalStateException("Blockchain transaction failed: " + txResponse.getError().getMessage());
            }

            String transactionHash = txResponse.getTransactionHash();
            TransactionReceiptProcessor receiptProcessor = new PollingTransactionReceiptProcessor(web3j, 1000, 15);
            TransactionReceipt receipt = receiptProcessor.waitForTransactionReceipt(transactionHash);

            if (!"0x1".equals(receipt.getStatus())) {
                throw new IllegalStateException("Blockchain transaction reverted for report " + reportId);
            }

            return transactionHash;
        } finally {
            web3j.shutdown();
        }
    }

    private String resolveContractAddress(Web3j web3j) throws Exception {
        if (hasContractCode(web3j, contractAddress)) {
            return contractAddress;
        }

        String deploymentAddress = loadAddressFromDeploymentArtifact();
        if (hasContractCode(web3j, deploymentAddress)) {
            return deploymentAddress;
        }

        for (String candidate : KNOWN_HARDHAT_ADDRESSES) {
            if (hasContractCode(web3j, candidate)) {
                return candidate;
            }
        }

        return contractAddress;
    }

    private boolean hasContractCode(Web3j web3j, String address) throws Exception {
        if (address == null || address.isBlank()) {
            return false;
        }

        EthGetCode codeResponse = web3j.ethGetCode(address, DefaultBlockParameterName.LATEST).send();
        return !codeResponse.hasError()
                && codeResponse.getCode() != null
                && !"0x".equals(codeResponse.getCode());
    }

    private String loadAddressFromDeploymentArtifact() {
        List<Path> candidates = List.of(
                Path.of("..", "..", "blockchain-net", "deployments", "WorkOrderRegistry.json"),
                Path.of("..", "blockchain-net", "deployments", "WorkOrderRegistry.json"),
                Path.of("blockchain-net", "deployments", "WorkOrderRegistry.json"),
                Path.of("deployments", "WorkOrderRegistry.json")
        );

        for (Path candidate : candidates) {
            try {
                Path normalized = candidate.normalize();
                if (!Files.exists(normalized)) {
                    continue;
                }

                JsonNode jsonNode = objectMapper.readTree(normalized.toFile());
                JsonNode addressNode = jsonNode.get("address");
                if (addressNode != null && !addressNode.asText().isBlank()) {
                    return addressNode.asText().trim();
                }
            } catch (IOException ignored) {
            }
        }

        return null;
    }
}
