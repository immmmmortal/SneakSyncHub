import requests
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

from core.models import Shoe
from members.models import ShoeNotificationPreference

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")


def get_image_embedding(image_url):
    response = requests.get(image_url)
    image = Image.open(response.raw).convert("RGB")

    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        embedding = model.get_image_features(**inputs)

    return embedding.squeeze(0)


def find_visually_similar_shoes(user):
    user_preferences = ShoeNotificationPreference.objects.filter(user=user)
    preferred_shoes = [pref.shoe for pref in user_preferences]

    scraped_shoes = Shoe.objects.exclude(id__in=[shoe.id for shoe in preferred_shoes])

    preferred_embeddings = {
        shoe.id: get_image_embedding(shoe.image) for shoe in preferred_shoes
    }
    scraped_embeddings = {
        shoe.id: get_image_embedding(shoe.image) for shoe in scraped_shoes
    }

    similar_shoes = []
    for pref_id, pref_embedding in preferred_embeddings.items():
        for scraped_id, scraped_embedding in scraped_embeddings.items():
            similarity = torch.nn.functional.cosine_similarity(
                pref_embedding, scraped_embedding, dim=0
            )
            if similarity.item() > 0.85:
                similar_shoes.append(Shoe.objects.get(id=scraped_id))

    return similar_shoes
