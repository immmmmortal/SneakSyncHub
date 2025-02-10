import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from core.models import Shoe
from members.models import ShoeNotificationPreference

nlp = spacy.load("en_core_web_sm")


def find_similar_shoes(user):
    """
    Find shoes similar to the ones in the user's notification preferences
    based on description similarity.
    """
    user_preferences = ShoeNotificationPreference.objects.filter(user=user)
    preferred_shoes = [pref.shoe for pref in user_preferences]
    preferred_texts = [shoe.description for shoe in preferred_shoes]

    scraped_shoes = Shoe.objects.exclude(id__in=[shoe.id for shoe in preferred_shoes])
    scraped_texts = [shoe.description for shoe in scraped_shoes]

    if not preferred_texts or not scraped_texts:
        return []

    vectorizer = TfidfVectorizer().fit(preferred_texts + scraped_texts)
    preferred_vectors = vectorizer.transform(preferred_texts)
    scraped_vectors = vectorizer.transform(scraped_texts)

    similarity_matrix = cosine_similarity(preferred_vectors, scraped_vectors)

    similar_shoes = []
    for idx, pref_shoe in enumerate(preferred_shoes):
        similar_indices = similarity_matrix[idx].argsort()[-3:][::-1]
        for sim_idx in similar_indices:
            similar_shoes.append(scraped_shoes[sim_idx])

    return similar_shoes
