# WSE225_load_wise_outline

**File Name**: WSE225_load_wise_outline.dtsx

## Package Properties

- PackageFormatVersion: SQL Server 2017

## Package Variables

- Name: CASE_OUTFILE
  - Data Type: String
  - Value: Case.txt
- Name: PLPDFLAG_OUTFILE
  - Data Type: String
  - Value: update_plpdflag.txt
- Name: UPC_OUTFILE
  - Data Type: String
  - Value: upc.txt
- Name: WISE_OUTLINE_INPUT
  - Data Type: String
  - Value: ex_pd.txt

## Event Handlers


## Connection Managers

- Name: Case_Outfile
  - Type: Flat File Connection Manager
  - Properties:
- Name: Plpdflag_outfile
  - Type: Unknown
  - Properties:
- Name: Upc_Outfile
  - Type: Unknown
  - Properties:
- Name: Wise_Outline_Input
  - Type: Unknown
  - Properties:

## Tasks

- Name: Create files case_outfile,plpdflag_outfile,upc-outfile
  - Type: Microsoft.Pipeline
  - Description: Data Flow Task
  - Components:
    - Name: Case File
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
    - Name: Case SQL
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
          - Value: with curr_item as (  
  select
      row_number() over ( partition by source_product_id order by creation_Date desc, expiration_date desc ) Row_ID,
  product_id, source_product_id, source_product_description, creation_date, expiration_date
  from WISE_DB.source_product
   )
select
 &#x27;&quot;I-&#x27;||i.source_product_id ||&#x27;&quot;&#x27; as Item,
      i.pack_conversion_factor as Pack
  from WISE_DB.source_product i , WISE_DB.wise_outline w, curr_item l
  where
    i.source_product_id &#x3D; w.item_nbr and
    i.source_product_id &#x3D; l.source_product_id and
    i.product_id &#x3D; l.product_id and
    i.expiration_date is null and
    l.Row_ID &#x3D; 1 and
    w.pd &lt;&gt; &#x27;Self Serve Bars&#x27; and  
    i.pack_conversion_factor &lt;&gt; 0
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
    - Name: CHERRY TOMATOS
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
          - Value: with wise_today as (
      select distinct w.item_nbr, x.pl_nbr
      from WISE_DB.WISE_OUTLINE w
      inner join WISE_DB.VW_XREF_STRPLPD x on x.pd_cde &#x3D; substr(w.pd, length(w.pd) -7, 2)
      )
      select
      &#x27;Week01&#x27; as week,
      &#x27;Plpdflagdata&#x27; as flag,
      &#x27;Day01&#x27; as day,
      &#x27;ST-025&#x27; as store,
      &#x27;I-&#x27;||y.item as item,
      &#x27;2015&#x27; as year,
      &#x27;Dollars&#x27; as dollars,
      WISE_DB.format_pl_essbase(y.pl) as pl,
      &#x27;0&#x27; as value
      from
      WISE_DB_STAGING.mirror_wise_outline_yesterday y left outer join wise_today t
      on y.item &#x3D; t.item_nbr and y.pl &#x3D; t.pl_nbr
      where t.item_nbr is null and y.pl not in (09,16)
      UNION ALL
      select
      &#x27;Week01&#x27; as week,
      &#x27;Plpdflagdata&#x27; as flag,
      &#x27;Day01&#x27; as day,
      &#x27;ST-025&#x27; as store,
      &#x27;I-&#x27;||t.item_nbr as item,
      &#x27;2015&#x27; as year,
      &#x27;Dollars&#x27; as dollars,
      WISE_DB.format_pl_essbase(t.pl_nbr) as pl,
      &#x27;1&#x27; as value
      from
      wise_today t left outer join WISE_DB_STAGING.mirror_wise_outline_yesterday y
      on t.item_nbr &#x3D; y.item and t.pl_nbr &#x3D; y.pl
      where y.item is null
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
    - Name: convert pl
      - Description: Data Conversion
      - Contact Info: Data Conversion;Microsoft Corporation; Microsoft SqlServer v10; (C) Microsoft Corporation; All Rights Reserved; http://www.microsoft.com/sql/support;0
      - Connections:
      - Properties:
    - Name: UPC file
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
    - Name: UPC sql
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
          - Value: with curr_item as (  
  select
      row_number() over ( partition by source_product_id order by creation_Date desc, expiration_date desc ) Row_ID,
  product_id, source_product_id, source_product_description, creation_date, expiration_date
  from WISE_DB.source_product
   )
 select
 i.source_product_id,
 &#x27;&quot;I-&#x27;||i.source_product_id||&#x27;&quot;&#x27; as item ,
 &#x27;&quot;&#x27;
 || substr(w.item,1,((length(w.item) - length(cast(w.item_nbr as varchar2(50))) - 3))) 
 || &#x27;-I-&#x27; 
 || i.source_product_id 
 || &#x27;-UPC-&#x27; 
 || a.alternative_product_id 
 ||&#x27;&quot;&#x27; as upc
from WISE_DB.source_product i, WISE_DB.wise_outline w, curr_item l, WISE_DB.alternative_product_id a
  where
  i.source_product_id &#x3D; w.item_nbr and
  i.source_product_id &#x3D; l.source_product_id and
  i.product_id &#x3D; l.product_id and
  i.product_id &#x3D; a.product_id and
  Row_ID &#x3D; 1
  order by i.source_product_id
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
    - Name: Write plpdflag file
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
- Name: Load STAGE_CASE_COUNT
  - Type: Microsoft.ExecuteSQLTask
  - Description: Execute SQL Task
  - Properties:
- Name: Load STAGE_ITEM_PL_MAPPING
  - Type: Microsoft.ExecuteSQLTask
  - Description: Execute SQL Task
  - Properties:
- Name: Load Wise mirror outline yesterday
  - Type: Microsoft.ExecuteSQLTask
  - Description: Execute SQL Task
  - Properties:
- Name: Load Wise Outline table
  - Type: Microsoft.Pipeline
  - Description: Data Flow Task
  - Components:
    - Name: Load wise_db_wise_outline table
      - Description: Oracle Destination
      - Contact Info: Oracle Destination;Microsoft Corporation; Microsoft SQL Server; (C) Microsoft Corporation; All Rights Reserved; http://www.microsoft.com/sql/support;1
      - Connections:
        - Name: ORACLEConnection
          - Description: The ORACLE runtime connection used to access the database.
      - Properties:
        - Name: TableName
          - Description: The name of the table to be fetched.
          - Value: &quot;WISE_DB&quot;.&quot;WISE_OUTLINE&quot;
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
          - Value: true
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
    - Name: Wise Outline data source
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
- Name: Load WISE_ITEM_CASE_COUNT_LOAD
  - Type: Microsoft.ExecuteSQLTask
  - Description: Execute SQL Task
  - Properties:
- Name: Load WISE_PL_PD_FLAG_LOAD
  - Type: Microsoft.ExecuteSQLTask
  - Description: Execute SQL Task
  - Properties:
- Name: Truncate WISE_DB Wise Outline
  - Type: Microsoft.ExecuteSQLTask
  - Description: Execute SQL Task
  - Properties:

## Precedence Constraints

- From: Package\Truncate WISE_DB Wise Outline
  - To: Package\Load Wise Outline table
  - Mode: 
  - Expression: 
- From: Package\Load Wise Outline table
  - To: Package\Create files case_outfile,plpdflag_outfile,upc-outfile
  - Mode: 
  - Expression: 
- From: Package\Load Wise mirror outline yesterday
  - To: Package\Truncate WISE_DB Wise Outline
  - Mode: 
  - Expression: 
- From: Package\Create files case_outfile,plpdflag_outfile,upc-outfile
  - To: Package\Load STAGE_CASE_COUNT
  - Mode: 
  - Expression: 
- From: Package\Create files case_outfile,plpdflag_outfile,upc-outfile
  - To: Package\Load STAGE_ITEM_PL_MAPPING
  - Mode: 
  - Expression: 
- From: Package\Load STAGE_CASE_COUNT
  - To: Package\Load WISE_ITEM_CASE_COUNT_LOAD
  - Mode: 
  - Expression: 
- From: Package\Load STAGE_ITEM_PL_MAPPING
  - To: Package\Load WISE_PL_PD_FLAG_LOAD
  - Mode: 
  - Expression: 
