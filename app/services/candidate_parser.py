import re
import spacy

# Load the English NLP model
nlp = spacy.load("en_core_web_sm")


def extract_candidate_details(text: str):
    """
    Extract candidate details from resume text.
    """

    # Process text with spaCy
    doc = nlp(text)

    # ------------------------
    # Name
    # ------------------------
    name = None

    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text
            break

    # ------------------------
    # Email
    # ------------------------
    email_pattern = r'[\w\.-]+@[\w\.-]+\.\w+'
    email_match = re.search(email_pattern, text)

    email = email_match.group() if email_match else None

    # ------------------------
    # Phone Number
    # ------------------------
    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?(\d{10})'
    phone_match = re.search(phone_pattern, text)

    phone = phone_match.group() if phone_match else None

    return {
        "name": name,
        "email": email,
        "phone": phone
    }