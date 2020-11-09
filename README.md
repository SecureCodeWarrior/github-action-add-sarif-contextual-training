# GitHub Action

This GitHub Action adds Secure Code Warrior contextual application security training material to SARIF files. This training material will be displayed within Code Scanning alerts if the resulting SARIF file is imported using the `github/codeql-action/upload-sarif` Action, and includes links to secure coding exercises and short explainer videos where available.

This Action currently supports adding training material based on CWE references (e.g. CWE 89) and common vulnerability phrases (e.g. use-after-free vulnerability) included in static analysis findings.

## Usage

### Individual SARIF file

```yaml
    steps:
      # Fetch SARIF - for example:
      # - Checkout the repository using `actions/checkout` if the SARIF file is committed. This example assumes the SARIF file is located at `sarif/findings.sarif` within the repository.
      #     - name: Checkout repository
      #       uses: actions/checkout@v2
      # - Fetch the SARIF file from your SAST tool. The vendor may already have a GitHub Action for this. This example assumes the SARIF file is fetched and saved to `sarif/findings.sarif`.
      #     - name: Download SARIF
      #       uses: vendor/sast-tool-sarif@v1
      #       with:
      #         user: ${{ secrets.USER }}
      #         key: ${{ secrets.KEY }}
      #         scan-id: ${{ secrets.SCAN_ID }}
      #         output-file: sarif/findings.sarif
      # - Convert a SAST tool report into SARIF. The vendor may already have a GitHub Action or script for this. This example assumes the converted SARIF file is located at `sarif/findings.sarif`.
      #     - name: Convert report to SARIF
      #       uses: vendor/sast-tool-sarif-converter@v1
      #       with:
      #         report-file: reports/sast-scan.xml
      #         output-file: sarif/findings.sarif

      - name: Add SCW Training
        uses: SecureCodeWarrior/github-action-add-sarif-contextual-training@v1
        with:
          inputSarifFile: sarif/findings.sarif
          outputSarifFile: sarif/findings.processed.sarif
          githubToken: ${{ secrets.GITHUB_TOKEN }}

      - name: Import Results
        uses: github/codeql-action/upload-sarif@v1
        with:
          sarif_file: sarif/findings.processed.sarif
```

### Multiple SARIF files using glob path

```yaml
    steps:
      # Fetch SARIF - see additional examples above
      - name: Download SARIF
        uses: vendor/sast-tool-sarif@v1
        with:
          user: ${{ secrets.USER }}
          key: ${{ secrets.KEY }}
          scan-id: ${{ secrets.SCAN_ID }}
          output-dir: ./sarifs # in this example we assume the tool outputs multiple SARIF files as .json files

      - name: Add SCW Training
        uses: SecureCodeWarrior/github-action-add-sarif-contextual-training@v1
        with:
          inputSarifFile: ./sarifs/*.json
          outputSarifFile: ./processed-sarifs
          githubToken: ${{ secrets.GITHUB_TOKEN }}

      - name: Import Results
        uses: github/codeql-action/upload-sarif@v1
        with:
          sarif_file: ./processed-sarifs
```

### Multiple SARIF files in directory

```yaml
    steps:
      # Fetch SARIF - see additional examples above
      - name: Download SARIF
        uses: vendor/sast-tool-sarif@v1
        with:
          user: ${{ secrets.USER }}
          key: ${{ secrets.KEY }}
          scan-id: ${{ secrets.SCAN_ID }}
          output-dir: ./sarifs # in this example we assume the tool outputs multiple SARIF files in nested directories within the specified output directory

      - name: Add SCW Training
        uses: SecureCodeWarrior/github-action-add-sarif-contextual-training@v1
        with:
          inputSarifFile: ./sarifs
          outputSarifFile: ./processed-sarifs
          githubToken: ${{ secrets.GITHUB_TOKEN }}

      - name: Import Results
        uses: github/codeql-action/upload-sarif@v1
        with:
          sarif_file: ./processed-sarifs
```

## Inputs

### `inputSarifFile`

The SARIF file(s) to add Secure Code Warrior contextual training material to. This can be a path to a single file (e.g. `./findings.sarif`), a glob path (e.g. `./scans/**/*.sarif`) or a directory (d.g. `./scans`), in which case all `.sarif` files recursively in the specified directory will be processed. **Default value:** `./findings.sarif`

### `outputSarifFile`

The output path of the resulting SARIF file(s) with Secure Code Warrior contextual training material appended. If a glob path or a directory was provided as the `inputSarifFile` input then the resulting SARIF files will be output to the `./processed-sarifs` directory, which can then simply be the path provided in the `sarif_file` input of the `github/codeql-action/upload-sarif` action. **Default value:** `./findings.processed.sarif`

### `githubToken` (optional)

Provide `${{ secrets.GITHUB_TOKEN }}` to use the GitHub access token automatically supplied by GitHub Workflows. This enables language-specific training links to be generated (where available) by fetching the repository language from the GitHub API.
