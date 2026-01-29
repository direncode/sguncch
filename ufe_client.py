"""
Undercurrent Flux Engine (UFE) API Client

Synchronous client for governance and policy modeling via the UFE API.
Energy function: E = α×trajectory_deviation + β×undercurrent_friction + γ×self_prediction_error

Domain: governance
- Input dimensions: 32 features
- Friction terms: stagnation_risk, engagement_drop
"""

from typing import Any, Dict, List, Optional

import httpx


class UFEClientError(Exception):
    """Base exception for UFE client errors."""
    pass


class UFEClient:
    """
    Synchronous client for the Undercurrent Flux Engine (UFE) API.

    Provides governance and policy modeling through latent space encoding,
    energy computation, friction analysis, and trajectory prediction.

    Example:
        client = UFEClient()
        health = client.health()
        print(f"API Status: {health['status']}")

        # Encode policy data (32-dimensional features)
        latent = client.encode(policy_features, "governance")

        # Compute energy landscape
        energy = client.energy(policy_features, "governance")
        print(f"Stagnation risk: {energy['friction_breakdown']['stagnation_risk']}")
    """

    BASE_URL = "https://latentintegrator-j3ul23w91-direns-projects-6fcf4bec.vercel.app"
    DOMAIN = "governance"
    INPUT_DIMENSIONS = 32
    LATENT_DIMENSIONS = 256
    FRICTION_TERMS = ["stagnation_risk", "engagement_drop"]

    def __init__(
        self,
        base_url: Optional[str] = None,
        timeout: float = 30.0,
    ):
        """
        Initialize the UFE client.

        Args:
            base_url: API base URL (defaults to production URL)
            timeout: Request timeout in seconds
        """
        self.base_url = (base_url or self.BASE_URL).rstrip("/")
        self.client = httpx.Client(timeout=timeout)

    def health(self) -> Dict[str, Any]:
        """
        Check API health status.

        Returns:
            Dict with status, latent_dim, and available domains
        """
        return self.client.get(f"{self.base_url}/api/health").json()

    def demo(self, domain: str) -> Dict[str, Any]:
        """
        Generate demo trajectory data for the specified domain.

        Args:
            domain: Domain name (e.g., "governance")

        Returns:
            Demo trajectory data for testing and visualization
        """
        return self.client.get(f"{self.base_url}/api/demo/{domain}").json()

    def encode(self, data: List, domain: str) -> Dict[str, Any]:
        """
        Encode input data into latent space representation.

        Args:
            data: Input tensor of shape [batch, sequence, feature_dim]
            domain: Domain name for encoding

        Returns:
            Latent vectors in 256-dimensional space
        """
        return self.client.post(
            f"{self.base_url}/api/encode",
            json={"data": data, "domain": domain}
        ).json()

    def energy(
        self,
        data: List,
        domain: str,
        weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Compute the energy landscape for input data.

        Energy function: E = α×trajectory_deviation + β×undercurrent_friction + γ×self_prediction_error

        Args:
            data: Input tensor of shape [batch, sequence, feature_dim]
            domain: Domain name for energy computation
            weights: Optional custom weights for energy terms

        Returns:
            Dict containing:
                - total_energy: Combined energy value
                - trajectory_deviation: Deviation from expected trajectory
                - undercurrent_friction: Hidden resistance factors
                - self_prediction_error: Model self-consistency error
                - friction_breakdown: Dict with domain-specific friction terms
        """
        body: Dict[str, Any] = {"data": data, "domain": domain}
        if weights:
            body["weights"] = weights
        return self.client.post(f"{self.base_url}/api/energy", json=body).json()

    def friction(self, latent: List, domain: str) -> Dict[str, Any]:
        """
        Compute friction terms from latent space representation.

        Friction terms for governance domain:
            - stagnation_risk: Risk of policy stagnation
            - engagement_drop: Decline in stakeholder engagement

        Args:
            latent: Latent vectors of shape [batch, 256]
            domain: Domain name for friction computation

        Returns:
            Friction analysis results
        """
        return self.client.post(
            f"{self.base_url}/api/friction",
            json={"latent": latent, "domain": domain}
        ).json()

    def predict(self, latent: List, num_steps: int = 10) -> Dict[str, Any]:
        """
        Predict future trajectory from latent state.

        Args:
            latent: Latent vectors of shape [batch, 256]
            num_steps: Number of prediction steps (default: 10)

        Returns:
            Predicted trajectory data
        """
        return self.client.post(
            f"{self.base_url}/api/predict",
            json={"latent": latent, "num_steps": num_steps}
        ).json()

    def close(self):
        """Close the HTTP client."""
        self.client.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


if __name__ == "__main__":
    # Quick test
    client = UFEClient()
    try:
        health = client.health()
        print(f"UFE API Status: {health.get('status', 'unknown')}")
        print(f"Latent Dimensions: {health.get('latent_dim', 'unknown')}")
        print(f"Available Domains: {health.get('domains', [])}")
    except Exception as e:
        print(f"Error connecting to UFE API: {e}")
    finally:
        client.close()
