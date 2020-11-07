const fs = require('fs');
const args = process.argv;
const inputFile = args[2] || 'vault.json';
const outputFile = args[3] || 'vault.csv';

console.log('\nREADING: ' + inputFile + '\n');

try {
    const contents = fs.readFileSync(inputFile);
    const vault = JSON.parse(contents);
    let notConverted = 0;
    let converted = 0;

    const loginFieldMapping = {
        'website': 'Login URL',
        'url': 'Login URL',
        'e-mail': 'e-mail',
        'email': 'e-mail',
        'username': 'Login Username',
        'password': 'Login Password',
        'security question': 'security question', 
        'security answer': 'security answer'
    };

    const loginRows = [];
    const noteRows = [];

    vault.items.forEach(item => {
        if (
            item.category === 'login'
            || item.category === 'password'
            || item.category === 'uncategorized'
        ) {
            let rowData = {
                'Title': item.title,
                'Notes': '"' + item.note.replace(/["]+/g, '\'') + '"',
                urls: []
            };

            let fieldCount = {};

            if (item.fields) {
                item.fields.filter(field => {
                    return field.value;
                }).forEach(field => {
                    let label = field.label.toLowerCase();
                    if (label === 'website' || label === 'url') {
                        rowData.urls.push('"' + field.value + '"')
                    } else {
                        let key = loginFieldMapping[label];
                        if (key) {
                            if (fieldCount[key]) {
                                let count = fieldCount[key]
                                fieldCount[key] = count + 1
                                key = key + ' ' + count
                            } else {
                                fieldCount[key] = 1
                            }
                            rowData[key] = '"' + field.value + '"';
                        }
                    }
                    
                });
            }

            if (!rowData['Login Username'] && rowData['e-mail']) {
                rowData['Login Username'] = rowData['e-mail'];
            }

            if (rowData.urls.length > 0) {
                rowData["Login URL"] = rowData.urls[0];
                let additionalUrls = '"' + rowData.urls.slice(1).map(url => url.replace(/['"]+/g, '')).join(';') + '"';
                rowData["Additional URLs"] = additionalUrls;
                delete rowData.urls;
            }

            loginRows.push(rowData);
            converted++
        } else if (item.category === 'note') {
            let rowData = {
                'Title': item.title,
                'Note': '"' + item.note.replace(/["]+/g, '\'') + '"'
            }
            noteRows.push(rowData);
        } else {
            notConverted++
            console.log('NOT CONVERTED: ', item.title, ' - ', item.category)
        }
    });

    let loginFields = ['Title','Login Username','Login Password','Login URL','Additional URLs','Notes'];
    loginRows.forEach(row => {
        Object.keys(row).forEach(key => {
            if (!loginFields.includes(key)) {
                loginFields.push(key);
            }
        })
    });

    let loginOutput = [loginFields.join(',')];

    let generateCsvRows = (row, fields, output) => {
        let rowOutput = [];
        fields.forEach(field => {
            if (row[field]) {
                rowOutput.push(row[field])
            } else {
                rowOutput.push("")
            }
        })
        output.push(rowOutput.join(','))
    };

    loginRows.forEach(row => generateCsvRows(row, loginFields, loginOutput));

    fs.writeFileSync(outputFile, loginOutput.join('\n'))
    console.log('WRITING: ' + outputFile);

    let noteFields = ['Title', 'Note'];
    let noteOutput = [noteFields.join(',')];
    noteRows.forEach(row => generateCsvRows(row, noteFields, noteOutput));

    let filenameComponents = outputFile.split('.');
    filenameComponents.splice(-1, 0, "-notes.");
    let noteOutputFile = filenameComponents.join('');
    fs.writeFileSync(noteOutputFile, noteOutput.join('\n'))
    console.log('WRITING: ' + noteOutputFile + '\n');

    console.log('SUCCESSFUL: ', converted, ' items. ')
    console.log('FAILED: ', notConverted, ' items. ')
} catch (err) {
    throw err;
}
