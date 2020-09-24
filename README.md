# GitHub Action

GitHub Action for adding Secure Code Warrior contextual application security training material to SARIF files. This training material will be displayed within Code Scanning alerts if the resulting SARIF file is imported using the github/codeql-action/upload-sarif Action.

## Usage

```yaml
    steps:
      # Fetch SARIF (e.g. from repository or SAST tool)

      - name: Add SCW Training
        uses: SecureCodeWarrior/github-action-add-sarif-contextual-training@v1
        with:
          inputSarifFile: sarif/findings.sarif
          outputSarifFile: sarif/findings.processed.sarif

      - name: Import Results
        uses: github/codeql-action/upload-sarif@v1
        with:
          sarif_file: sarif/findings.processed.sarif
```
