#!/usr/bin/env python3
"""
Test Open-World ML API connection before running the backend
"""

import os
import sys
from openai import OpenAI


def test_openworld_api():
    """Test Open-World API connection and models"""

    # Configuration
    api_key = "sk-ow-AO33HZv_wjAIFUdjeYSXnGO3xCnaWUyMihYpwB3jT8U"

    # Check if we should use port-forward or cluster internal endpoint
    base_url = os.getenv(
        "OPENAI_BASE_URL",
        "http://api-gateway.open-world.svc.cluster.local/v1"
    )

    print("=" * 60)
    print("Testing Open-World ML API Connection")
    print("=" * 60)
    print(f"API Key: {api_key[:20]}...")
    print(f"Base URL: {base_url}")
    print()

    try:
        client = OpenAI(api_key=api_key, base_url=base_url)

        # Test 1: List models
        print("📋 Test 1: Listing available models...")
        models = client.models.list()
        print(f"✅ Found {len(models.data)} models:")

        target_models = ["qwen2.5:7b-instruct", "tinyllama:latest"]
        for model in models.data:
            marker = "✓" if model.id in target_models else " "
            print(f"   [{marker}] {model.id}")

        print()

        # Test 2: Test classifier model (fast/small)
        print("🔍 Test 2: Testing classifier model (tinyllama)...")
        response = client.chat.completions.create(
            model="tinyllama:latest",
            messages=[{"role": "user", "content": "Say 'OK' in one word"}],
            max_tokens=5
        )
        result = response.choices[0].message.content
        print(f"✅ Response: {result}")
        print()

        # Test 3: Test main model
        print("🤖 Test 3: Testing main model (qwen2.5:7b-instruct)...")
        response = client.chat.completions.create(
            model="qwen2.5:7b-instruct",
            messages=[{
                "role": "user",
                "content": "In one short sentence, what is machine learning?"
            }],
            max_tokens=50
        )
        result = response.choices[0].message.content
        print(f"✅ Response: {result}")
        print()

        # Test 4: Test streaming
        print("📡 Test 4: Testing streaming...")
        print("Response: ", end="", flush=True)
        response = client.chat.completions.create(
            model="tinyllama:latest",
            messages=[{"role": "user", "content": "Count to 3"}],
            max_tokens=20,
            stream=True
        )
        for chunk in response:
            if chunk.choices[0].delta.content:
                print(chunk.choices[0].delta.content, end="", flush=True)
        print("\n")

        print("=" * 60)
        print("✅ All tests passed!")
        print("=" * 60)
        print("\nOpen-World API is working correctly.")
        print("You can now run the backend with these settings:")
        print()
        print("  cd backend")
        print("  cp .env.openworld .env")
        print("  source venv/bin/activate")
        print("  uvicorn main:app --reload")
        print()

        return True

    except Exception as e:
        print("=" * 60)
        print("❌ Error:")
        print("=" * 60)
        print(f"{type(e).__name__}: {e}")
        print()
        print("Troubleshooting:")
        print()

        if "Connection" in str(e) or "connect" in str(e).lower():
            print("  Connection Error - Try these steps:")
            print()
            print("  1. Check if running inside Kubernetes cluster:")
            print("     kubectl get nodes")
            print()
            print("  2. If outside cluster, use port-forward:")
            print("     kubectl port-forward svc/api-gateway 8080:80 -n open-world")
            print("     Then set: OPENAI_BASE_URL=http://localhost:8080/v1")
            print()
            print("  3. Verify Open-World API is running:")
            print("     kubectl get pods -n open-world")
            print()
        elif "401" in str(e) or "auth" in str(e).lower():
            print("  Authentication Error:")
            print("  - Verify API key is correct")
            print("  - Check if API key has expired")
            print()
        elif "404" in str(e):
            print("  Endpoint Not Found:")
            print("  - Verify base URL is correct")
            print("  - Check if Open-World API is deployed")
            print()
        else:
            print("  Unknown error. Check:")
            print("  - Network connectivity")
            print("  - API endpoint accessibility")
            print("  - Firewall settings")
            print()

        return False


if __name__ == "__main__":
    print()
    success = test_openworld_api()
    sys.exit(0 if success else 1)
