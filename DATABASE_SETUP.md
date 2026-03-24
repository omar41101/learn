# Database Setup Instructions

## Before Running the Server

You must set up the MySQL database first:

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` file
Copy `.env.example` to `.env` and fill in your database credentials:
```bash
cp .env.example .env
```

Then edit `.env` and set:
- `DB_HOST`: Your MySQL host (usually localhost)
- `DB_PORT`: MySQL port (usually 3306)
- `DB_NAME`: Database name (usually flas_learning)
- `DB_USER`: MySQL username (usually root)
- `DB_PASSWORD`: Your MySQL password

### 3. Run Database Setup
```bash
npm run setup-db
# or
node setup-mysql.js
```

This will:
- ✅ Create the database
- ✅ Create all required tables (users, exercises, levels, etc.)
- ✅ Insert default levels
- ✅ Set up indexes for performance

### 4. Start the Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

## Troubleshooting

### "500 Error when creating exercise"
- Make sure the database setup ran successfully
- Check that MySQL is running
- Verify your `.env` file has correct credentials
- Check server console for detailed error messages

### "Cannot connect to database"
- Verify MySQL is running
- Check DB_HOST, DB_USER, DB_PASSWORD in `.env`
- Make sure the database user has permissions to create databases and tables

### Tables don't exist
- Run `npm run setup-db` to create all tables
- Check MySQL manually: `mysql -u root -p flas_learning`
