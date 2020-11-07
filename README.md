# Enpass JSON to 1Password CSV
Enpass has decided not to offer CSV export anymore with version 6 (current status: February 2019). This is annoying because the generated Enpass JSON export file can neither be read in 1Password nor in Dashlane. 

But since most password managers can import the 1Password CSV format, it seemed practical to me if there is a simple converter.

This script is based on [Migvill's enpass-to-csv](https://github.com/migvill/enpass-to-csv) script. I only adapted his global CSV adjustments to the [1Password format](https://support.1password.com/create-csv-files/). 

## Requirements
* Node.js
* Enpass 6
* Optional: 1password

## Installation
1. Open your CLI and navigate to the downloaded folder
2. `npm install`

## Usage
1. Export your Enpass 6 vault into json format from the desktop application. It is possible that the app language has to be set to English first. 
2. Copy the JSON file into the folder with the script
3. Convert your data
    * `node convert.js <YOUR ENPASS FILE>.json <NAME OF OUTPUT FILE>.csv`
    * Example: `node convert.js enpass.json 1password.csv`
    * Script will output two files: `<NAME OF OUTPUT FILE>.csv` and `<NAME OF OUTPUT FILE>-notes.csv`. The first file has all login/password/uncategorized entries, and the second has all secure notes.
4. Use the [mrc-converter-suite](https://1password.community/discussion/comment/494051/#Comment_494051) to convert these CSV files to .1pif files.
    * `/usr/bin/perl convert.pl csv <NAME OF OUTPUT FILE>.csv -v --addfields --outfile <NAME OF OUTPUT FILE>`
    * Run this command for both CSV outputs. Use different outfiles to prevent overwriting the previous conversion (or just convert and import to 1password one at a time).
5. Import the resulting .1pif file into 1password.

**Note: Only elements with the types "Login", "Password", "Uncategorized", or "Note" are converted.**

*During the conversion, all unconverted elements are displayed in the console. These can then be maintained manually. 
Optionally this log can be saved to a text file.*

`node convert.js enpass.json 1password.csv | tee NotConvertedItems.txt`

### Disclaimer
Use at own risk. Please verify the csv output yourself before importing to another password manager
