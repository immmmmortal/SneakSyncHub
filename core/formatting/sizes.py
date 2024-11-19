from decimal import Decimal, InvalidOperation
from typing import List


class Formatter:
    @staticmethod
    def get_stripped_sizes(sizes) -> List[str] | None:
        # Remove letters and any extra spaces
        text = sizes.replace('M', '').strip()

        # If the size includes a slash (indicating multiple formats),
        # split and take the first part
        if '/' in text:
            text = text.split('/')[0].strip()

        # Remove spaces and return only numeric size
        text = text.replace(' ', '')

        # Validate if size_text is numeric or a valid size format
        if text.replace('.', '', 1).isdigit():
            return text

        return None

    @staticmethod
    def get_decimal_from_string(string: str) -> Decimal:
        try:
            # Remove any non-numeric characters except dot
            numeric = ''.join(
                c for c in string if c.isdigit() or c == '.')
            return Decimal(numeric)
        except InvalidOperation:
            raise ValueError(f"Invalid price format: {string}")
