import pytest
import numpy as np
import pandas as pd


class TestDataProcessing:
    """Test data processing utilities."""
    
    def test_csv_loading(self, tmp_path):
        """Test CSV file loading."""
        csv_file = tmp_path / "test_data.csv"
        data = pd.DataFrame({
            'timestamp': ['2024-01-01', '2024-01-02'],
            'vibration': [0.5, 0.7],
            'temperature': [25.0, 26.0]
        })
        data.to_csv(csv_file, index=False)
        
        loaded_data = pd.read_csv(csv_file)
        assert len(loaded_data) == 2
        assert list(loaded_data.columns) == ['timestamp', 'vibration', 'temperature']
    
    def test_missing_value_handling(self):
        """Test handling of missing values."""
        data = pd.DataFrame({
            'value1': [1.0, np.nan, 3.0],
            'value2': [4.0, 5.0, np.nan]
        })
        
        # Forward fill
        filled_data = data.fillna(method='ffill')
        assert not filled_data.isna().any().any()
    
    def test_outlier_detection(self):
        """Test outlier detection."""
        data = np.array([1, 2, 2, 3, 3, 3, 4, 100])  # 100 is an outlier
        
        mean = np.mean(data)
        std = np.std(data)
        z_scores = np.abs((data - mean) / std)
        outliers = z_scores > 2.5
        
        assert np.sum(outliers) >= 1


class TestSensorData:
    """Test sensor data handling."""
    
    def test_sensor_value_validation(self):
        """Test sensor value validation."""
        valid_range = (0, 100)
        
        def validate_sensor_value(value, valid_range):
            return valid_range[0] <= value <= valid_range[1]
        
        assert validate_sensor_value(50, valid_range) is True
        assert validate_sensor_value(150, valid_range) is False
        assert validate_sensor_value(-10, valid_range) is False
    
    def test_sensor_data_aggregation(self):
        """Test aggregation of sensor data."""
        sensor_readings = [
            {'timestamp': '2024-01-01 10:00', 'value': 10.5},
            {'timestamp': '2024-01-01 10:01', 'value': 11.2},
            {'timestamp': '2024-01-01 10:02', 'value': 10.8},
        ]
        
        values = [reading['value'] for reading in sensor_readings]
        stats = {
            'mean': np.mean(values),
            'min': np.min(values),
            'max': np.max(values),
            'count': len(values)
        }
        
        assert stats['count'] == 3
        assert stats['mean'] == pytest.approx(10.833333, rel=1e-4)
        assert stats['min'] == 10.5
        assert stats['max'] == 11.2


class TestAnomalyDetection:
    """Test anomaly detection algorithms."""
    
    def test_threshold_based_detection(self):
        """Test threshold-based anomaly detection."""
        data = [20, 21, 22, 23, 100, 24, 25]
        threshold = 50
        
        anomalies = [x for x in data if x > threshold]
        assert len(anomalies) == 1
        assert anomalies[0] == 100
    
    def test_statistical_anomaly_detection(self):
        """Test statistical anomaly detection."""
        normal_data = np.random.normal(loc=50, scale=5, size=1000)
        test_point = 100  # Far from mean
        
        mean = np.mean(normal_data)
        std = np.std(normal_data)
        z_score = abs((test_point - mean) / std)
        
        is_anomaly = z_score > 3
        assert is_anomaly is True
