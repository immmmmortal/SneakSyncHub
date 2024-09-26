class SizeFormatter:
    @staticmethod
    def get_stripped_sizes(self, sizes):
        # Remove letters and any extra spaces
        text = sizes.replace('M', '').strip()

        # If the size includes a slash (indicating multiple formats), split and take the first part
        if '/' in text:
            text = text.split('/')[0].strip()

        # Remove spaces and return only numeric size
        text = text.replace(' ', '')

        # Validate if size_text is numeric or a valid size format
        if text.replace('.', '', 1).isdigit():
            return text

        return None
