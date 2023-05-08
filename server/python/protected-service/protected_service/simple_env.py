from typing import Mapping, Optional
from dotenv import dotenv_values


class SimpleEnv:

    lookups: Mapping[str, str] = None

    @classmethod
    def load_env(cls):
        if not cls.lookups:
            cls.lookups = dotenv_values(".env")

        return cls.lookups

    @classmethod
    def get_value(cls, key: str) -> Optional[str]:
        lookup_dict = cls.load_env()
        if not lookup_dict:
            return None

        return lookup_dict[key]