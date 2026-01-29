"""
Undercurrent Flux Engine (UFE) API Client

Async client for governance and policy modeling via the UFE API.
Energy function: E = α×trajectory_deviation + β×undercurrent_friction + γ×self_prediction_error

Domain: governance
- Input dimensions: 32 features
- Friction terms: stagnation_risk, engagement_drop
"""

import asyncio
from dataclasses import dataclass
from typing import Any

import httpx


@dataclass
class EnergyResponse:
    """Response from the energy endpoint."""
    total_energy: float
    trajectory_deviation: float
    undercurrent_friction: float
    friction_breakdown: dict[str, float]

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "EnergyResponse":
        return cls(
            total_energy=data["total_energy"],
            trajectory_deviation=data["trajectory_deviation"],
            undercurrent_friction=data["undercurrent_friction"],
            friction_breakdown=data.get("friction_breakdown", {}),
        )


@dataclass
class HealthResponse:
    """Response from the health endpoint."""
    status: str
    latent_dim: int
    domains: list[str]

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "HealthResponse":
        return cls(
            status=data["status"],
            latent_dim=data["latent_dim"],
            domains=data.get("domains", []),
        )


class UFEClientError(Exception):
    """Base exception for UFE client errors."""
    pass


class UFEClient:
    """
    Async client for the Undercurrent Flux Engine (UFE) API.

    Provides governance and policy modeling through latent space encoding,
    energy computation, friction analysis, and trajectory prediction.

    Example:
        async with UFEClient() as client:
            health = await client.health()
            print(f"API Status: {health.status}")

            # Get demo trajectory data
            demo_data = await client.demo()

            # Encode policy data (32-dimensional features)
            latent = await client.encode(policy_features)

            # Compute energy landscape
            energy = await client.energy(policy_features)
            print(f"Stagnation risk: {energy.friction_breakdown['stagnation_risk']}")
    """

    BASE_URL = "https://latentintegrator-j3ul23w91-direns-projects-6fcf4bec.vercel.app"
    DOMAIN = "governance"
    INPUT_DIMENSIONS = 32
    LATENT_DIMENSIONS = 256
    FRICTION_TERMS = ["stagnation_risk", "engagement_drop"]

    def __init__(
        self,
        base_url: str | None = None,
        timeout: float = 30.0,
        domain: str | None = None,
    ):
        """
        Initialize the UFE client.

        Args:
            base_url: API base URL (defaults to production URL)
            timeout: Request timeout in seconds
            domain: Domain for modeling (defaults to 'governance')
        """
        self.base_url = (base_url or self.BASE_URL).rstrip("/")
        self.timeout = timeout
        self.domain = domain or self.DOMAIN
        self._client: httpx.AsyncClient | None = None

    async def __aenter__(self) -> "UFEClient":
        """Enter async context manager."""
        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.timeout,
            headers={"Content-Type": "application/json"},
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        """Exit async context manager."""
        if self._client:
            await self._client.aclose()
            self._client = None

    @property
    def client(self) -> httpx.AsyncClient:
        """Get the HTTP client, raising if not initialized."""
        if self._client is None:
            raise UFEClientError(
                "Client not initialized. Use 'async with UFEClient() as client:'"
            )
        return self._client

    async def _request(
        self,
        method: str,
        endpoint: str,
        json: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Make an HTTP request to the API.

        Args:
            method: HTTP method (GET, POST)
            endpoint: API endpoint path
            json: JSON body for POST requests

        Returns:
            Parsed JSON response

        Raises:
            UFEClientError: On request failure
        """
        try:
            response = await self.client.request(method, endpoint, json=json)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise UFEClientError(
                f"API request failed: {e.response.status_code} - {e.response.text}"
            ) from e
        except httpx.RequestError as e:
            raise UFEClientError(f"Request error: {e}") from e

    async def health(self) -> HealthResponse:
        """
        Check API health status.

        Returns:
            HealthResponse with status, latent_dim, and available domains

        Example:
            health = await client.health()
            assert health.status == "healthy"
            assert "governance" in health.domains
        """
        data = await self._request("GET", "/api/health")
        return HealthResponse.from_dict(data)

    async def demo(self) -> dict[str, Any]:
        """
        Generate demo trajectory data for the governance domain.

        Returns:
            Demo trajectory data for testing and visualization

        Example:
            demo_data = await client.demo()
            trajectory = demo_data["trajectory"]
        """
        return await self._request("GET", f"/api/demo/{self.domain}")

    async def encode(self, data: list[list[list[float]]]) -> dict[str, Any]:
        """
        Encode input data into latent space representation.

        Args:
            data: Input tensor of shape [batch, sequence, 32]
                  Each feature vector must have 32 dimensions

        Returns:
            Latent vectors in 256-dimensional space

        Example:
            # Single sequence with 10 timesteps, 32 features each
            features = [[[0.1] * 32 for _ in range(10)]]
            latent = await client.encode(features)
        """
        self._validate_input_dimensions(data)
        return await self._request(
            "POST",
            "/api/encode",
            json={"data": data, "domain": self.domain},
        )

    async def energy(self, data: list[list[list[float]]]) -> EnergyResponse:
        """
        Compute the energy landscape for input data.

        Energy function: E = α×trajectory_deviation + β×undercurrent_friction + γ×self_prediction_error

        Args:
            data: Input tensor of shape [batch, sequence, 32]

        Returns:
            EnergyResponse containing:
                - total_energy: Combined energy value
                - trajectory_deviation: Deviation from expected trajectory
                - undercurrent_friction: Hidden resistance factors
                - friction_breakdown: Dict with stagnation_risk and engagement_drop

        Example:
            energy = await client.energy(policy_data)
            if energy.friction_breakdown["stagnation_risk"] > 0.7:
                print("Warning: High stagnation risk detected")
        """
        self._validate_input_dimensions(data)
        data_response = await self._request(
            "POST",
            "/api/energy",
            json={"data": data, "domain": self.domain},
        )
        return EnergyResponse.from_dict(data_response)

    async def friction(self, latent: list[list[float]]) -> dict[str, Any]:
        """
        Compute friction terms from latent space representation.

        Friction terms for governance domain:
            - stagnation_risk: Risk of policy stagnation
            - engagement_drop: Decline in stakeholder engagement

        Args:
            latent: Latent vectors of shape [batch, 256]

        Returns:
            Friction analysis results

        Example:
            # First encode to get latent representation
            encoded = await client.encode(data)
            latent_vectors = encoded["latent"]

            # Then compute friction
            friction = await client.friction(latent_vectors)
        """
        self._validate_latent_dimensions(latent)
        return await self._request(
            "POST",
            "/api/friction",
            json={"latent": latent, "domain": self.domain},
        )

    async def predict(
        self,
        latent: list[list[float]],
        num_steps: int = 10,
    ) -> dict[str, Any]:
        """
        Predict future trajectory from latent state.

        Args:
            latent: Latent vectors of shape [batch, 256]
            num_steps: Number of prediction steps (default: 10)

        Returns:
            Predicted trajectory data

        Example:
            # Predict 20 steps into the future
            prediction = await client.predict(latent_vectors, num_steps=20)
            future_states = prediction["trajectory"]
        """
        self._validate_latent_dimensions(latent)
        return await self._request(
            "POST",
            "/api/predict",
            json={"latent": latent, "num_steps": num_steps},
        )

    def _validate_input_dimensions(self, data: list[list[list[float]]]) -> None:
        """Validate input data has correct dimensions (32 features)."""
        if not data or not data[0] or not data[0][0]:
            raise UFEClientError("Input data cannot be empty")
        if len(data[0][0]) != self.INPUT_DIMENSIONS:
            raise UFEClientError(
                f"Input features must have {self.INPUT_DIMENSIONS} dimensions, "
                f"got {len(data[0][0])}"
            )

    def _validate_latent_dimensions(self, latent: list[list[float]]) -> None:
        """Validate latent vectors have correct dimensions (256)."""
        if not latent or not latent[0]:
            raise UFEClientError("Latent vectors cannot be empty")
        if len(latent[0]) != self.LATENT_DIMENSIONS:
            raise UFEClientError(
                f"Latent vectors must have {self.LATENT_DIMENSIONS} dimensions, "
                f"got {len(latent[0])}"
            )


async def main():
    """Example usage of the UFE client."""
    async with UFEClient() as client:
        # Check health
        print("Checking API health...")
        health = await client.health()
        print(f"  Status: {health.status}")
        print(f"  Latent dimensions: {health.latent_dim}")
        print(f"  Available domains: {health.domains}")

        # Get demo data
        print("\nFetching demo trajectory...")
        demo = await client.demo()
        print(f"  Demo data keys: {list(demo.keys())}")

        # Example: encode synthetic policy data
        print("\nEncoding synthetic policy data...")
        # Create sample data: 1 batch, 5 timesteps, 32 features
        sample_data = [[[0.5] * 32 for _ in range(5)]]
        encoded = await client.encode(sample_data)
        print(f"  Encoded response keys: {list(encoded.keys())}")

        # Compute energy
        print("\nComputing energy landscape...")
        energy = await client.energy(sample_data)
        print(f"  Total energy: {energy.total_energy:.4f}")
        print(f"  Trajectory deviation: {energy.trajectory_deviation:.4f}")
        print(f"  Undercurrent friction: {energy.undercurrent_friction:.4f}")
        print(f"  Friction breakdown:")
        for term, value in energy.friction_breakdown.items():
            print(f"    - {term}: {value:.4f}")


if __name__ == "__main__":
    asyncio.run(main())
