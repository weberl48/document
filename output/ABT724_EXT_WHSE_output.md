# ABT724_EXT_WHSE

**File Name**: ABT724_EXT_WHSE.dtsx

## Package Properties

- PackageFormatVersion: SQL Server 2017

## Package Variables

- Name: ARCHIVE_DATE_TIMESTAMP
  - Data Type: String
  - Value: .202266_16341
- Name: VENDOR_FILE_ARCHIVE
  - Data Type: String
  - Value: D:\SSIS\ASSISWISET\DATA\Archive\unldvend.dat.202266_16341
- Name: VENDOR_FILE_INPUT
  - Data Type: String
  - Value: unldvend.dat
- Name: VENDOR_FILE_OUTPUT
  - Data Type: String
  - Value: unldvend.txt
- Name: WAREHOUSE_FILE_ARCHIVE
  - Data Type: String
  - Value: D:\SSIS\ASSISWISET\DATA\Archive\unldwhse.dat.202266_16341
- Name: WAREHOUSE_FILE_INPUT
  - Data Type: String
  - Value: unldwhse.dat
- Name: WAREHOUSE_FILE_OUTPUT
  - Data Type: String
  - Value: unldwhse.txt

## Event Handlers


## Connection Managers

- Name: con_Unloadvend_Input
  - Type: Unknown
  - Properties:
- Name: con_Unloadvend_Output
  - Type: Unknown
  - Properties:
- Name: con_Unload_Whse
  - Type: Unknown
  - Properties:
- Name: con_Unload_Whse_Output
  - Type: Unknown
  - Properties:

## Tasks

- Name: Archive Unloadvend Dat File
  - Type: Microsoft.FileSystemTask
  - Description: File System Task
- Name: Archive Vendor Dat File
  - Type: Microsoft.FileSystemTask
  - Description: File System Task
- Name: Format Vendor Unload file
  - Type: Microsoft.Pipeline
  - Description: Data Flow Task
  - Components:
    - Name: Conditional Split
      - Description: Evaluates and directs rows in a dataset.
      - Contact Info: Conditional Split;Microsoft Corporation; Microsoft SqlServer v10; (C) Microsoft Corporation; All Rights Reserved; http://www.microsoft.com/sql/support;0
      - Connections:
      - Properties:
    - Name: Unloadvend dat file source
      - Description: Flat File Source
      - Contact Info: Flat File Source;Microsoft Corporation; Microsoft SqlServer v10; (C) Microsoft Corporation; All Rights Reserved; http://www.microsoft.com/sql/support;1
      - Connections:
        - Name: FlatFileConnection
          - Description: 
      - Properties:
        - Name: RetainNulls
          - Description: Specifies whether zero-length columns are treated as null.
          - Value: false
        - Name: FileNameColumnName
          - Description: Specifies the name of an output column containing the file name. If no name is specified, no output column containing the file name will be generated.
          - Value: 
    - Name: Unloadvend txt destination
      - Description: Flat File Destination
      - Contact Info: Flat File Destination;Microsoft Corporation; Microsoft SqlServer v10; (C) Microsoft Corporation; All Rights Reserved; http://www.microsoft.com/sql/support;0
      - Connections:
        - Name: FlatFileConnection
          - Description: 
      - Properties:
        - Name: Overwrite
          - Description: Specifies whether the data will overwrite or append to the destination file.
          - Value: true
        - Name: Header
          - Description: Specifies the text to write to the destination file before any data is written.
          - Value: 
        - Name: EscapeQualifier
          - Description: When text qualifier is enabled, specifies whether the text qualifier in the data written to the destination file will be escaped or not.
          - Value: false
- Name: Format Warehouse file and unload to output file
  - Type: Microsoft.Pipeline
  - Description: Data Flow Task
  - Components:
    - Name: Formatted Warehouse Unload file
      - Description: Flat File Destination
      - Contact Info: Flat File Destination;Microsoft Corporation; Microsoft SqlServer v10; (C) Microsoft Corporation; All Rights Reserved; http://www.microsoft.com/sql/support;0
      - Connections:
        - Name: FlatFileConnection
          - Description: 
      - Properties:
        - Name: Overwrite
          - Description: Specifies whether the data will overwrite or append to the destination file.
          - Value: true
        - Name: Header
          - Description: Specifies the text to write to the destination file before any data is written.
          - Value: 
        - Name: EscapeQualifier
          - Description: When text qualifier is enabled, specifies whether the text qualifier in the data written to the destination file will be escaped or not.
          - Value: false
    - Name: Select from MIRROR_WAREHOUSE_STAGING
      - Description: Oracle Source
      - Contact Info: Oracle Source;Microsoft Corporation; Microsoft SQL Server; (C) Microsoft Corporation; All Rights Reserved; http://www.microsoft.com/sql/support;1
      - Connections:
        - Name: ORACLEConnection
          - Description: The ORACLE runtime connection used to access the database.
      - Properties:
        - Name: TableName
          - Description: The name of the table to be fetched.
          - Value: 
        - Name: SqlCommand
          - Description: The SQL command to be executed.
          - Value: SELECT
	CASE WHEN WHSE_STATE &#x3D; &#x27;PA&#x27; THEN &#x27;PENNSYLVANIA&#x27; ELSE &#x27;ROCHESTER&#x27; END, 
	CASE WHEN WHSE_STATE &#x3D; &#x27;PA&#x27; AND WHSE_LOCATION &#x3D; &#x27;INSIDE&#x27; THEN &#x27;PENNSYLVANIA INSIDE&#x27; WHEN WHSE_STATE &#x3D; &#x27;PA&#x27; AND
	WHSE_LOCATION &#x3D; &#x27;OUTSIDE&#x27; THEN &#x27;PENNSYLVANIA OUTSIDE&#x27; WHEN WHSE_STATE &#x3D; 
	&#x27;NY&#x27; AND
	WHSE_LOCATION &#x3D; &#x27;INSIDE&#x27; THEN &#x27;ROCHESTER INSIDE&#x27; WHEN WHSE_STATE &#x3D; &#x27;NY&#x27; AND
	WHSE_LOCATION &#x3D; &#x27;OUTSIDE&#x27; THEN &#x27;ROCHESTER OUTSIDE&#x27; WHEN WHSE_STATE &lt;&gt; &#x27;NY&#x27; AND
	WHSE_STATE &lt;&gt; &#x27;PA&#x27; AND
	WHSE_LOCATION &#x3D; &#x27;INSIDE&#x27; THEN &#x27;ROCHESTER INSIDE&#x27; WHEN WHSE_STATE &lt;&gt; &#x27;NY&#x27; AND
	WHSE_STATE &lt;&gt; &#x27;PA&#x27; AND
	WHSE_LOCATION &#x3D; &#x27;OUTSIDE&#x27; THEN &#x27;ROCHESTER OUTSIDE&#x27; ELSE &#x27;UNKNOWN&#x27; END, &#x27;W&#x27; 
	|| WHSE_NBR, &#x27;W&#x27; || WHSE_NBR || &#x27; - &#x27; || WHSE_DESC
FROM
	WISE_DB_STAGING.MIRROR_WAREHOUSE_STAGING
        - Name: BatchSize
          - Description: Specify the number of rows fetched per batch.
          - Value: 1000
        - Name: LobChunkSize
          - Description: Determines the chunk size allocation for LOB columns
          - Value: 32768
        - Name: DefaultCodePage
          - Description: The code page to use when code page information is unavailable from the data source.
          - Value: 1252
        - Name: PrefetchCount
          - Description: Number of pre-fetched rows.
          - Value: 0
        - Name: AccessMode
          - Description: The mode used to access the database.
          - Value: 1
- Name: Load MIRROR_WAREHOUSE_STAGING Table
  - Type: Microsoft.Pipeline
  - Description: Data Flow Task
  - Components:
    - Name: MIRROR_WAREHOUSE_STAGING Table
      - Description: Oracle Destination
      - Contact Info: Oracle Destination;Microsoft Corporation; Microsoft SQL Server; (C) Microsoft Corporation; All Rights Reserved; http://www.microsoft.com/sql/support;1
      - Connections:
        - Name: ORACLEConnection
          - Description: The ORACLE runtime connection used to access the database.
      - Properties:
        - Name: TableName
          - Description: The name of the table to be fetched.
          - Value: &quot;WISE_DB_STAGING&quot;.&quot;MIRROR_WAREHOUSE_STAGING&quot;
        - Name: BatchSize
          - Description: Specify the number of rows fetched per batch.
          - Value: 1000
        - Name: TransactionSize
          - Description: The number of rows inserted under the same transaction.
          - Value: 1000
        - Name: LobChunkSize
          - Description: Determines the chunk size allocation for LOB columns
          - Value: 32768
        - Name: DefaultCodePage
          - Description: The code page to use when code page information is unavailable from the data source.
          - Value: 1252
        - Name: FastLoad
          - Description: Apply conventional bulk load.
          - Value: false
        - Name: MaxErrors
          - Description: Maximum errors allowed.
          - Value: 0
        - Name: NoLogging
          - Description: Disables target table logging. Used to minimize the amount of redo generated.
          - Value: false
        - Name: Parallel
          - Description: Enables parallel loading of the target table.
          - Value: false
        - Name: TableSubname
          - Description: Table sub-name (Partition, SubPartition).
          - Value: 
        - Name: TransferBufferSize
          - Description: Transfer data buffer size (KB).
          - Value: 64
    - Name: UNLOAD_WHSE FILE
      - Description: Flat File Source
      - Contact Info: Flat File Source;Microsoft Corporation; Microsoft SqlServer v10; (C) Microsoft Corporation; All Rights Reserved; http://www.microsoft.com/sql/support;1
      - Connections:
        - Name: FlatFileConnection
          - Description: 
      - Properties:
        - Name: RetainNulls
          - Description: Specifies whether zero-length columns are treated as null.
          - Value: false
        - Name: FileNameColumnName
          - Description: Specifies the name of an output column containing the file name. If no name is specified, no output column containing the file name will be generated.
          - Value: 
- Name: Truncate MIRROR_WAREHOUSE_STAGING Table
  - Type: Microsoft.ExecuteSQLTask
  - Description: Execute SQL Task
  - Properties:

## Precedence Constraints

- From: Package\Truncate MIRROR_WAREHOUSE_STAGING Table
  - To: Package\Load MIRROR_WAREHOUSE_STAGING Table
  - Mode: 
  - Expression: 
- From: Package\Load MIRROR_WAREHOUSE_STAGING Table
  - To: Package\Format Warehouse file and unload to output file
  - Mode: 
  - Expression: 
- From: Package\Format Warehouse file and unload to output file
  - To: Package\Format Vendor Unload file
  - Mode: 
  - Expression: 
- From: Package\Format Vendor Unload file
  - To: Package\Archive Unloadvend Dat File
  - Mode: 
  - Expression: 
- From: Package\Format Vendor Unload file
  - To: Package\Archive Vendor Dat File
  - Mode: 
  - Expression: 
