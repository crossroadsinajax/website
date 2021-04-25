from riot import Venv, latest

venv = Venv(
    pys=["3.9"],
    venvs=[
        Venv(
            pkgs={
                "bandit": ["==1.7.*"],
            },
            venvs=[
                Venv(
                    name="bandit",
                    command="bandit -c .bandit.yml -r church/ crossroads/ prayer/ chat/",
                ),
            ],
        ),
        Venv(
            pkgs={
                "black": ["==20.8b1"],
                "isort": [latest],
            },
            venvs=[
                Venv(
                    name="check_fmt",
                    command="black --check .",
                ),
                Venv(
                    name="fmt",
                    command="isort . && black .",
                ),
                Venv(
                    name="black",
                    command="black {cmdargs}",
                ),
            ],
        ),
        Venv(
            pkgs={
                "flake8": ["==3.8.*"],
                "flake8-isort": [latest],
            },
            venvs=[
                Venv(
                    name="flake8",
                    command="flake8 {cmdargs}",
                ),
                Venv(
                    name="lint",
                    command="flake8 .",
                ),
            ],
        ),
        Venv(
            pkgs={
                "yamllint": ["==1.26.*"],
            },
            venvs=[
                Venv(
                    name="yamllint",
                    command="yamllint {cmdargs}",
                ),
                Venv(
                    name="yaml_lint",
                    command='yamllint `find . -type f -name "*.yml"`',
                ),
            ],
        ),
    ],
)
