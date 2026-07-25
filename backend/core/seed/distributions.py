import random


def weighted_choice(distribution):
    choices = list(distribution.keys())
    weights = list(distribution.values())

    return random.choices(
        choices,
        weights=weights,
        k=1
    )[0]