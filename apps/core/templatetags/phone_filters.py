"""
Template filters for phone number formatting.

Provides filters for converting phone numbers to various formats,
including tel: link format (digits with leading +).
"""
from django import template

register = template.Library()


@register.filter
def phone_for_tel(phone_string):
    """
    Convert a phone number to tel: link format (digits with leading +).
    
    Removes all non-digit characters and ensures the number starts with +.
    
    Example:
        +38 (093) 170-78-67 → +380931707867
        380931707867        → +380931707867
    
    Args:
        phone_string: Phone number as string (e.g., "+38 (093) 170-78-67")
    
    Returns:
        Phone number in tel: format (e.g., "+380931707867") or empty string if invalid.
    """
    if not phone_string:
        return ''
    
    # Extract only digits from the phone string
    digits = ''.join(filter(str.isdigit, str(phone_string)))
    
    if not digits:
        return ''
    
    # If already starts with country code (380 for Ukraine), prepend +
    if digits.startswith('380'):
        return f'+{digits}'
    
    # If starts with 0, assume it's Ukrainian format: 0XXXXXXXXX → +380XXXXXXXXX
    if digits.startswith('0'):
        return f'+38{digits}'
    
    # Otherwise, assume it's already complete without + prefix
    return f'+{digits}'
