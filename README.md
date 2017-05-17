## SQL Share

Sharing server for SQL documents created with [SQL Tabs](http://www.sqltabs.com).

### Installation

```
git clone https://github.com/sasha-alias/sqlshare.git
cd sqlshare
psql postgres://user@host:port/dbname -f db/create.sql
npm install
export SQLSHARE_PORT = 8080
export SQLSHARE_DB = postgres://user@host:port/dbname
npm start
```

### Testing

Worth running this, as it confirms if your server is set up properly, and also inserts a dummy document.

Note: Leave the above running, as this test script uses the same environment variables to talk to it.

```
cd sqlshare
export SQLSHARE_PORT = 8080
export SQLSHARE_DB = postgres://user@host:port/dbname
npm test
```

### Use

Point your browser to http://localhost:8080/ and you should see a list of documents. Click on a document to open it in a new tab.

