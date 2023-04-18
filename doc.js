const fs = require("fs"),
    xml2js = require("xml2js"),
    path = require("path"),
    handlebars = require("handlebars"),
    templateFile = fs.readFileSync("./template.md.handlebars", "utf-8"),
    template = handlebars.compile(templateFile),
    config = {
        inputDirectory: "./input",
        outputDirectory: "./output",
        fileExtension: ".dtsx",
        errorLogFile: "./errorLog.txt",
        dtprojFile: "./input.dtproj"
    };

function dataTypeToString(dataType) {
    const dataTypeMapping = {
        0: "Empty",
        2: "SmallInt",
        3: "Integer",
        4: "Single",
        5: "Double",
        6: "Currency",
        7: "Date",
        8: "String",
        9: "Object",
        10: "Error",
        11: "Boolean",
        12: "Variant",
        13: "DataObject",
        14: "Decimal",
        16: "TinyInt",
        17: "UnsignedTinyInt",
        18: "UnsignedSmallInt",
        19: "UnsignedInt",
        20: "BigInt",
        21: "UnsignedBigInt",
        72: "Guid",
        128: "Binary",
        129: "Char",
        130: "VarChar",
        131: "Numeric",
        132: "Decimal",
        133: "Date",
        134: "Time",
        135: "Timestamp",
        136: "LongVarChar",
        138: "LongVarWChar",
        139: "LongVarBinary",
    };

    return dataTypeMapping[dataType] || "Unknown";
}

function convertPackageFormatVersion(versionNumber) {
    const versions = {
        "2": "SQL Server 2005",
        "3": "SQL Server 2008",
        "4": "SQL Server 2008 R2",
        "5": "SQL Server 2012",
        "6": "SQL Server 2014",
        "7": "SQL Server 2016",
        "8": "SQL Server 2017",
        "9": "SQL Server 2019"
    };

    return versions[versionNumber] || "Unknown";
}
function connectionManagerTypeToString(dtsid) {
    const connectionManagerTypeMapping = {
        "{BD39384D-2C8D-4713-89DE-99CE866B303C}": "Flat File Connection Manager",
        "{D2FF200E-DD0E-4B8D-87BF-392F4A7A1C2A}": "ADO.NET Connection Manager",
        "{3C3A8FCD-7FEF-4F94-A9E1-A4A8C4BB4D3A}": "OLE DB Connection Manager",
        "{AEC313ED-9B84-4A87-93A9-34B934CC2E2F}": "Oracle Connection Manager",
        "{220A2DC2-0DC5-41F8-9386-1AE6DC1D6C78}": "ODBC Connection Manager",
    };

    return connectionManagerTypeMapping[dtsid] || "Unknown";
}


function extractPackageVariables(result) {
    let variables = [];

    if (result['DTS:Executable']['DTS:Variables'] && result['DTS:Executable']['DTS:Variables'][0]['DTS:Variable']) {
        const packageVariables = result['DTS:Executable']['DTS:Variables'][0]['DTS:Variable'];
        packageVariables.forEach((variable) => {
            const variableName = variable['$']['DTS:ObjectName'];
            const variableDataType = variable['DTS:VariableValue'] ? variable['DTS:VariableValue'][0]['$']['DTS:DataType'] : 'undefined';
            const variableValue = variable['DTS:VariableValue'] ? variable['DTS:VariableValue'][0]['_'] : 'undefined';
            variables.push({
                name: variableName,
                dataType: dataTypeToString(variableDataType),
                value: variableValue,
            });
        });
    }

    return variables;
}


function generateMarkdownContent(data) {
    return template(data);
}

function logError(errorMessage) {
    fs.appendFileSync(config.errorLogFile, `${errorMessage}\n`, (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
}

function extractForEachLoopProperties(executable) {
    let properties = {};

    if (executable['DTS:ObjectData'][0]['FEL:FELoop']) {
        const loopProperties = executable['DTS:ObjectData'][0]['FEL:FELoop']['$'];
        for (const key in loopProperties) {
            properties[key] = loopProperties[key];
        }
    }

    return properties;
}

function extractPackageProperties(result) {
    let properties = {};

    if (result['DTS:Executable']['DTS:Property']) {
        const packageProperties = result['DTS:Executable']['DTS:Property'];
        packageProperties.forEach((property) => {
            const propertyName = property['$']['DTS:Name'];
            const propertyValue = property['_'];

            if (propertyName === 'PackageFormatVersion') {
                properties[propertyName] = convertPackageFormatVersion(propertyValue);
            } else {
                properties[propertyName] = propertyValue;
            }
        });
    }

    return properties;
}


function extractEventHandlers(result) {
    let eventHandlers = [];

    if (result['DTS:Executable']['DTS:EventHandlers'] && result['DTS:Executable']['DTS:EventHandlers'][0]['DTS:Executable']) {
        const packageEventHandlers = result['DTS:Executable']['DTS:EventHandlers'][0]['DTS:Executable'];
        packageEventHandlers.forEach((eventHandler) => {
            const eventHandlerName = eventHandler['$']['DTS:ObjectName'];
            const eventHandlerType = eventHandler['$']['DTS:ExecutableType'];
            eventHandlers.push({
                name: eventHandlerName,
                type: eventHandlerType,
            });
        });
    }

    return eventHandlers;
}


function extractConnectionManagers(result) {
    let connectionManagers = [];

    if (
        result['DTS:Executable']['DTS:ConnectionManagers'] &&
        result['DTS:Executable']['DTS:ConnectionManagers'][0]['DTS:ConnectionManager']
    ) {
        const packageConnectionManagers = result['DTS:Executable']['DTS:ConnectionManagers'][0]['DTS:ConnectionManager'];
        packageConnectionManagers.forEach((cm) => {
            const name = cm['$']['DTS:ObjectName'];
            const type = connectionManagerTypeToString(cm['$']['DTS:DTSID']);

            let connectionManager = {
                name: name,
                type: type,
                properties: {},
            };

            // Extract properties for all connection manager types
            if (cm['DTS:ObjectData'] && cm['DTS:ObjectData'][0]['DTS:ConnectionManager'] && cm['DTS:ObjectData'][0]['DTS:ConnectionManager']['DTS:Property']) {
                const properties = cm['DTS:ObjectData'][0]['DTS:ConnectionManager']['DTS:Property'];
                properties.forEach((prop) => {
                    const propName = prop['$']['DTS:Name'];
                    const propValue = prop['_'];
                    connectionManager.properties[propName] = propValue

                });
            }

            connectionManagers.push(connectionManager);
        });
    }

    return connectionManagers;
}



function extractPrecedenceConstraints(result) {
    const precedenceConstraints = [];

    if (result['DTS:Executable']['DTS:PrecedenceConstraints'] && result['DTS:Executable']['DTS:PrecedenceConstraints'][0]['DTS:PrecedenceConstraint']) {
        const packagePrecedenceConstraints = result['DTS:Executable']['DTS:PrecedenceConstraints'][0]['DTS:PrecedenceConstraint'];
        packagePrecedenceConstraints.forEach((pc) => {
            const fromTask = pc['$']['DTS:From'];
            const toTask = pc['$']['DTS:To'];
            const constraintMode = pc['$']['DTS:ConstraintMode'];
            const expression = pc['$']['DTS:Expression'] || '';

            precedenceConstraints.push({
                from: fromTask,
                to: toTask,
                mode: constraintMode,
                expression: expression,
            });
        });
    }

    return precedenceConstraints;
}
function extractTasks(result) {
    let tasks = [];

    const executables = result['DTS:Executable']['DTS:Executables'][0]['DTS:Executable'];
    executables.forEach(executable => {
        const taskType = executable['$']['DTS:ExecutableType'];
        const taskName = executable['$']['DTS:ObjectName'];
        const taskDescription = executable['$']['DTS:Description'];

        let task = {
            type: taskType,
            name: taskName,
            description: taskDescription,
        };

        if (taskType === 'Microsoft.Pipeline') {
            task.components = extractDataFlowTaskComponents(executable);
        } else if (taskType === 'Microsoft.ExecuteSQLTask') {
            task.properties = extractExecuteSQLTaskProperties(executable);
        } else if (taskType === 'Microsoft.ForEachLoop') {
            task.properties = extractForEachLoopProperties(executable);
        } else {
            task.otherProperties = {}; // You can add more cases to handle other task types and display their properties as needed
        }

        tasks.push(task);
    });

    return tasks;
}

function extractDataFlowTaskComponents(executable) {
    let components = [];

    if (executable['DTS:ObjectData']) {
        const packageComponents = executable['DTS:ObjectData'][0]['pipeline'][0]['components'][0]['component'];
        packageComponents.forEach(component => {
            const componentName = component['$']['name'];
            const componentDescription = component['$']['description'];
            const contactInfo = component['$']['contactInfo'];
            let componentData = {
                name: componentName,
                description: componentDescription,
                contactInfo: contactInfo,
                connections: [],
                properties: [],
            };

            // Display Connections
            if (component['connections']) {
                const packageConnections = component['connections'][0]['connection'];
                packageConnections.forEach(connection => {
                    const connectionName = connection['$']['name'];
                    const connectionDescription = connection['$']['description'];
                    componentData.connections.push({
                        name: connectionName,
                        description: connectionDescription,
                    });
                });
            }

            // Display Properties
            if (component['properties']) {
                const packageProperties = component['properties'][0]['property'];
                packageProperties.forEach(property => {
                    const propertyName = property['$']['name'];
                    const propertyDescription = property['$']['description'];
                    const propertyValue = property['_'];
                    componentData.properties.push({
                        name: propertyName,
                        description: propertyDescription,
                        value: propertyValue,
                    });
                });
            }

            components.push(componentData);
        });
    }

    return components;
}

function extractExecuteSQLTaskProperties(executable) {
    let properties = {};

    // Display properties for Execute SQL Task
    const packageProperties = executable['DTS:ObjectData'][0]['SQLTask:SqlTaskData']['$'];
    for (const key in packageProperties) {
        properties[key] = packageProperties[key];
    }

    return properties;
}

// Read the XML file
// Read all files in the directory
fs.readdir(config.inputDirectory, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
        if (path.extname(file) === config.fileExtension) {
            fs.readFile(path.join(config.inputDirectory, file), 'utf8', (err, data) => {
                if (err) throw err;

                xml2js.parseString(data, (err, result) => {
                    if (err) {
                        logError(`Error parsing ${file}: ${err.message}`);
                        return;
                    }

                    let output = {
                        fileName: file,
                        packageName: '',
                        packageProperties: [],
                        packageVariables: [],
                        eventHandlers: [],
                        connectionManagers: [],
                        tasks: [],
                        precedenceConstraints: [],
                    };

                    const packageName = result['DTS:Executable']['$']['DTS:ObjectName'];
                    output.packageName = packageName;

                    output.packageProperties = extractPackageProperties(result);
                    output.packageVariables = extractPackageVariables(result);
                    output.eventHandlers = extractEventHandlers(result);
                    output.connectionManagers = extractConnectionManagers(result);
                    output.tasks = extractTasks(result);
                    output.precedenceConstraints = extractPrecedenceConstraints(result);

                    const outputFileName = path.join(config.outputDirectory, file.replace(config.fileExtension, '_output.md'));
                    const outputJsonFileName = path.join(config.outputDirectory, file.replace(config.fileExtension, '_output.json'));

                    console.log(`Results for ${file} saved to ${outputFileName}`);

                    const markdownContent = generateMarkdownContent(output);
                    fs.writeFileSync(outputFileName, markdownContent, 'utf8', (err) => {
                        if (err) throw err;
                    });

                    fs.writeFileSync(outputJsonFileName, JSON.stringify(output, null, 2), 'utf8', (err) => {
                        if (err) throw err;
                    });
                });
            });
        }
    });
});