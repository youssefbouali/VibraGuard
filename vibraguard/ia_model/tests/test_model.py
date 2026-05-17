import pytest
import numpy as np
from pathlib import Path


@pytest.fixture
def sample_vibration_data():
    """Generate sample vibration data for testing."""
    np.random.seed(42)
    return np.random.randn(100, 10)


@pytest.fixture
def sample_labels():
    """Generate sample labels for testing."""
    return np.random.randint(0, 2, 100)


class TestDataHandling:
    """Test data handling and preprocessing."""
    
    def test_sample_data_shape(self, sample_vibration_data):
        """Test that sample data has correct shape."""
        assert sample_vibration_data.shape == (100, 10)
    
    def test_sample_labels_shape(self, sample_labels):
        """Test that sample labels have correct shape."""
        assert sample_labels.shape == (100,)
    
    def test_data_normalization(self, sample_vibration_data):
        """Test data normalization."""
        mean = np.mean(sample_vibration_data)
        std = np.std(sample_vibration_data)
        normalized_data = (sample_vibration_data - mean) / std
        
        assert np.abs(np.mean(normalized_data)) < 1e-10
        assert np.abs(np.std(normalized_data) - 1.0) < 1e-10


class TestModelOperations:
    """Test model operations and utilities."""
    
    def test_data_split(self, sample_vibration_data, sample_labels):
        """Test train/test split functionality."""
        split_ratio = 0.8
        split_idx = int(len(sample_vibration_data) * split_ratio)
        
        X_train = sample_vibration_data[:split_idx]
        y_train = sample_labels[:split_idx]
        X_test = sample_vibration_data[split_idx:]
        y_test = sample_labels[split_idx:]
        
        assert len(X_train) + len(X_test) == len(sample_vibration_data)
        assert len(y_train) + len(y_test) == len(sample_labels)
    
    def test_feature_extraction(self, sample_vibration_data):
        """Test feature extraction."""
        features = {
            'mean': np.mean(sample_vibration_data, axis=0),
            'std': np.std(sample_vibration_data, axis=0),
            'max': np.max(sample_vibration_data, axis=0),
            'min': np.min(sample_vibration_data, axis=0),
        }
        
        assert len(features) == 4
        assert features['mean'].shape == (10,)
        assert features['std'].shape == (10,)
    
    def test_prediction_format(self, sample_labels):
        """Test prediction output format."""
        predictions = np.random.randint(0, 2, len(sample_labels))
        
        assert predictions.shape == sample_labels.shape
        assert np.all((predictions == 0) | (predictions == 1))


class TestModelMetrics:
    """Test model evaluation metrics."""
    
    def test_accuracy_calculation(self, sample_labels):
        """Test accuracy calculation."""
        predictions = sample_labels.copy()  # Perfect predictions
        accuracy = np.mean(predictions == sample_labels)
        
        assert accuracy == 1.0
    
    def test_confusion_metrics(self, sample_labels):
        """Test confusion matrix components."""
        # Create predictions with some errors
        predictions = sample_labels.copy()
        predictions[0:5] = 1 - predictions[0:5]
        
        tp = np.sum((predictions == 1) & (sample_labels == 1))
        fp = np.sum((predictions == 1) & (sample_labels == 0))
        tn = np.sum((predictions == 0) & (sample_labels == 0))
        fn = np.sum((predictions == 0) & (sample_labels == 1))
        
        assert tp + fp + tn + fn == len(sample_labels)
