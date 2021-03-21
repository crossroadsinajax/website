from riot import Venv

venv = Venv(
    pys=["3.9"],
    venvs=[
        Venv(
            pkgs={
                "black": "==20.8b1",
            },
            venvs=[
                Venv(
                    name="check_fmt",
                    command="black --check .",
                ),
                Venv(
                    name="fmt",
                    command="black .",
                ),
                Venv(
                    name="black",
                    command="black {cmdargs}",
                ),
            ],
        ),
        Venv(
            pkgs={
                "flake8": "==3.8.*",
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
                "yamllint": "==1.26.*",
            },
            venvs=[
                Venv(
                    name="yamllint",
                    command="yamllint {cmdargs}",
                ),
                Venv(
                    name="yaml_lint",
                    command="yamllint `find . -type f -name \"*.yml\"`",
                ),
            ],
        ),
    ],
)
