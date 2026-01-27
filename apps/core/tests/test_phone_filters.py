"""
Tests for phone number filters.
"""
from django.test import TestCase
from apps.core.templatetags.phone_filters import phone_for_tel


class PhoneForTelFilterTestCase(TestCase):
    """Test cases for phone_for_tel template filter."""
    
    def test_ukraine_formatted_number(self):
        """Test conversion of formatted Ukrainian phone number."""
        result = phone_for_tel('+38 (093) 170-78-67')
        self.assertEqual(result, '+380931707867')
    
    def test_plain_international_format(self):
        """Test plain international format."""
        result = phone_for_tel('+380931707867')
        self.assertEqual(result, '+380931707867')
    
    def test_country_code_only(self):
        """Test number starting with country code."""
        result = phone_for_tel('380931707867')
        self.assertEqual(result, '+380931707867')
    
    def test_local_format(self):
        """Test local format with leading 0."""
        result = phone_for_tel('0931707867')
        self.assertEqual(result, '+380931707867')
    
    def test_international_number(self):
        """Test international number (non-Ukraine)."""
        result = phone_for_tel('+48 (459) 567-884')
        self.assertEqual(result, '+48459567884')
    
    def test_empty_string(self):
        """Test empty string input."""
        result = phone_for_tel('')
        self.assertEqual(result, '')
    
    def test_none_input(self):
        """Test None input."""
        result = phone_for_tel(None)
        self.assertEqual(result, '')
    
    def test_invalid_input(self):
        """Test input with no digits."""
        result = phone_for_tel('abc-def')
        self.assertEqual(result, '')
