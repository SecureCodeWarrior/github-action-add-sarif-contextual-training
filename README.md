# GitHub Action

GitHub Action for adding Secure Code Warrior contextual application security training material to SARIF files. This training material will be displayed within Code Scanning alerts if the resulting SARIF file is imported using the `github/codeql-action/upload-sarif` Action.

Currently supports adding training material based on CWE references included in static analysis findings.

## Usage

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

## Inputs

### `inputSarifFile`

The SARIF file to add Secure Code Warrior contextual training material to. **Default value:** `./findings.sarif`

### `outputSarifFile`

The SARIF file to add Secure Code Warrior contextual training material to. **Default value:** `./findings.processed.sarif`

### `githubToken` (optional)

Provide `${{ secrets.GITHUB_TOKEN }}` to use the GitHub access token automatically supplied by GitHub Workflows. This enables language-specific training links to be generated (where available) by fetching the repository language from the GitHub API.
