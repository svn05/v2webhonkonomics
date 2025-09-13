# investease.py
# Minimal Python SDK for "Hack the North 2025 – Portfolio Simulation & Market Sandbox API"
# Requires: pip install requests

from __future__ import annotations
from typing import Any, Dict, List, Optional
import requests


DEFAULT_BASE_URL = "https://2dcq63co40.execute-api.us-east-1.amazonaws.com/dev"


class InvestEaseAPIError(Exception):
    """HTTP error raised by InvestEaseAPI calls."""
    def __init__(self, status_code: int, message: str, payload: Optional[Dict[str, Any]] = None):
        super().__init__(f"[{status_code}] {message}")
        self.status_code = status_code
        self.payload = payload or {}


class InvestEaseAPI:
    """
    Tiny Python wrapper for the InvestEase (RBC sandbox) REST API.

    Typical usage:
        token_info = InvestEaseAPI.register("Team Alpha", "teamalpha@example.com")
        api = InvestEaseAPI(token=token_info["jwtToken"])
        client = api.create_client("John Doe", "john.doe@example.com", 10000)
        portfolio = api.create_portfolio(client["id"], "balanced", 5000)
        sim = api.simulate_client(client["id"], months=6)
        analysis = api.get_portfolio_analysis(portfolio["id"])
    """

    def __init__(self, token: Optional[str] = None, base_url: str = DEFAULT_BASE_URL, timeout: int = 30):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._session = requests.Session()
        self._token = token

    # ---------- Internal helpers ----------

    @staticmethod
    def _json(obj: Any) -> Dict[str, Any]:
        return obj if isinstance(obj, dict) else {}

    @property
    def _headers(self) -> Dict[str, str]:
        h = {"Content-Type": "application/json"}
        if self._token:
            h["Authorization"] = f"Bearer {self._token}"
        return h

    def _request(self, method: str, path: str, *, json: Optional[Dict[str, Any]] = None) -> Any:
        url = f"{self.base_url}{path}"
        r = self._session.request(method, url, headers=self._headers, json=json, timeout=self.timeout)
        if not r.ok:
            try:
                payload = r.json()
                msg = payload.get("message") or r.text
            except Exception:
                payload = None
                msg = r.text
            raise InvestEaseAPIError(r.status_code, msg, payload)
        if r.status_code == 204 or not r.content:
            return None
        try:
            return r.json()
        except ValueError:
            return r.text  # fallback

    # ---------- Clients ----------

    def create_client(self, name: str, email: str, cash: float) -> Dict[str, Any]:
        """POST /clients"""
        body = {"name": name, "email": email, "cash": cash}
        return self._request("POST", "/clients", json=body)

    def list_clients(self) -> List[Dict[str, Any]]:
        """GET /clients"""
        return self._request("GET", "/clients")

    def get_client(self, client_id: str) -> Dict[str, Any]:
        """GET /clients/{clientId}"""
        return self._request("GET", f"/clients/{client_id}")

    def update_client(self, client_id: str, *, name: Optional[str] = None, email: Optional[str] = None) -> Dict[str, Any]:
        """PUT /clients/{clientId} (only name/email updatable)"""
        body: Dict[str, Any] = {}
        if name is not None:
            body["name"] = name
        if email is not None:
            body["email"] = email
        if not body:
            raise ValueError("No valid fields to update. Provide name and/or email.")
        return self._request("PUT", f"/clients/{client_id}", json=body)

    def delete_client(self, client_id: str) -> Dict[str, Any]:
        """DELETE /clients/{clientId}"""
        return self._request("DELETE", f"/clients/{client_id}")

    def deposit(self, client_id: str, amount: float) -> Dict[str, Any]:
        """POST /clients/{clientId}/deposit"""
        if amount <= 0:
            raise ValueError("Amount must be positive.")
        return self._request("POST", f"/clients/{client_id}/deposit", json={"amount": amount})

    # ---------- Portfolios ----------

    def create_portfolio(self, client_id: str, strategy: str, initial_amount: float) -> Dict[str, Any]:
        """
        POST /clients/{clientId}/portfolios
        strategy one of: aggressive_growth | growth | balanced | conservative | very_conservative
        """
        if initial_amount <= 0:
            raise ValueError("initial_amount must be positive.")
        body = {"type": strategy, "initialAmount": float(initial_amount)}
        return self._request("POST", f"/clients/{client_id}/portfolios", json=body)

    def list_portfolios(self, client_id: str) -> List[Dict[str, Any]]:
        """GET /clients/{clientId}/portfolios"""
        return self._request("GET", f"/clients/{client_id}/portfolios")

    def get_portfolio(self, portfolio_id: str) -> Dict[str, Any]:
        """GET /portfolios/{portfolioId}"""
        return self._request("GET", f"/portfolios/{portfolio_id}")

    def transfer_to_portfolio(self, portfolio_id: str, amount: float) -> Dict[str, Any]:
        """POST /portfolios/{portfolioId}/transfer (client cash -> portfolio)"""
        if amount <= 0:
            raise ValueError("Amount must be positive.")
        return self._request("POST", f"/portfolios/{portfolio_id}/transfer", json={"amount": amount})

    def withdraw_from_portfolio(self, portfolio_id: str, amount: float) -> Dict[str, Any]:
        """POST /portfolios/{portfolioId}/withdraw (portfolio -> client cash)"""
        if amount <= 0:
            raise ValueError("Amount must be positive.")
        return self._request("POST", f"/portfolios/{portfolio_id}/withdraw", json={"amount": amount})

    def get_portfolio_analysis(self, portfolio_id: str) -> Dict[str, Any]:
        """GET /portfolios/{portfolioId}/analysis"""
        return self._request("GET", f"/portfolios/{portfolio_id}/analysis")

    # ---------- Simulations ----------

    def simulate_client(self, client_id: str, months: int) -> Dict[str, Any]:
        """POST /client/{clientId}/simulate  (1..12 months)"""
        if not (1 <= months <= 12):
            raise ValueError("months must be in the range 1..12.")
        return self._request("POST", f"/client/{client_id}/simulate", json={"months": months})
