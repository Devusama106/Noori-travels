import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const dbPath = path.join(process.cwd(), "data", "noori.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// ---- Schema ----
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER', -- USER | ADMIN
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- PENDING | ACTIVE | REJECTED
  walletBalance REAL DEFAULT 0,
  bookingLimit REAL DEFAULT 0, -- max total (PKR) a USER can have in active bookings; 0 = unlimited
  accountLocked INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS airlines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  code TEXT,
  logoUrl TEXT, -- image URL or base64 data URI
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS flights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  airlineName TEXT NOT NULL,
  airlineCode TEXT,
  flightNumber TEXT NOT NULL,
  packageType TEXT DEFAULT 'Flight', -- Flight | Umrah Package
  originCity TEXT NOT NULL,
  originCode TEXT NOT NULL,
  destinationCity TEXT NOT NULL,
  destinationCode TEXT NOT NULL,
  departDate TEXT NOT NULL,
  departTime TEXT NOT NULL,
  arriveDate TEXT NOT NULL,
  arriveTime TEXT NOT NULL,
  duration TEXT NOT NULL,
  stops INTEGER DEFAULT 0,
  returnDepartDate TEXT,
  returnDepartTime TEXT,
  returnArriveDate TEXT,
  returnArriveTime TEXT,
  returnDuration TEXT,
  returnOriginCity TEXT,
  returnOriginCode TEXT,
  returnDestinationCity TEXT,
  returnDestinationCode TEXT,
  class TEXT DEFAULT 'Economy',
  meal TEXT DEFAULT 'No Meal',
  baggage TEXT DEFAULT '20KG+7KG',
  refundable INTEGER DEFAULT 0,
  price REAL NOT NULL,
  currency TEXT DEFAULT 'PKR',
  supplier TEXT DEFAULT 'Direct',
  seatsAvailable INTEGER DEFAULT 9,
  source TEXT DEFAULT 'MANUAL', -- MANUAL (admin-entered) | AMADEUS (live search import)
  externalOfferId TEXT, -- Amadeus offer id, used to avoid re-inserting the same live offer twice
  createdBy INTEGER,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS beneficiary_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bankName TEXT NOT NULL,
  accountTitle TEXT NOT NULL,
  accountNumber TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS deposits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  depositRef TEXT UNIQUE NOT NULL,
  userId INTEGER NOT NULL,
  mode TEXT NOT NULL, -- Bank Transfer | Cheque | Cash | Online Payment
  beneficiaryAccountId INTEGER,
  agentBankName TEXT,
  agentAccountNumber TEXT,
  amount REAL NOT NULL,
  paymentDate TEXT NOT NULL,
  documentReference TEXT,
  attachment TEXT, -- base64 data URI of the payment slip (image/pdf)
  attachmentName TEXT,
  additionalInfo TEXT,
  status TEXT DEFAULT 'Pending', -- Pending | Approved | Rejected
  reviewedBy INTEGER,
  reviewedAt TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (beneficiaryAccountId) REFERENCES beneficiary_accounts(id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bookingRef TEXT UNIQUE NOT NULL,
  pnr TEXT,
  userId INTEGER NOT NULL,
  flightId INTEGER NOT NULL,
  passengers TEXT NOT NULL, -- JSON array
  totalFare REAL NOT NULL,
  status TEXT DEFAULT 'Pending', -- Pending | Confirmed | Ticketed | Cancelled
  paymentStatus TEXT DEFAULT 'N/A', -- N/A | Awaiting Approval | Approved | Rejected
  approvedBy INTEGER,
  approvedAt TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (flightId) REFERENCES flights(id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  flightId INTEGER NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  UNIQUE(userId, flightId),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (flightId) REFERENCES flights(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES users(id)
);
`);

// ---- Migrations for DBs created before these columns existed ----
function ensureColumn(table, column, ddl) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}
ensureColumn("users", "bookingLimit", "bookingLimit REAL DEFAULT 0");
ensureColumn("users", "phone", "phone TEXT");
ensureColumn("users", "address", "address TEXT");
ensureColumn("users", "status", "status TEXT NOT NULL DEFAULT 'ACTIVE'");
ensureColumn("users", "resetToken", "resetToken TEXT");
ensureColumn("users", "resetTokenExpiry", "resetTokenExpiry TEXT");
ensureColumn("bookings", "paymentStatus", "paymentStatus TEXT DEFAULT 'N/A'");
ensureColumn("bookings", "approvedBy", "approvedBy INTEGER");
ensureColumn("bookings", "approvedAt", "approvedAt TEXT");
ensureColumn("flights", "source", "source TEXT DEFAULT 'MANUAL'");
ensureColumn("flights", "externalOfferId", "externalOfferId TEXT");

// ---- Seed default admin + demo user ----
function seedUsers() {
  const count = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
  if (count === 0) {
    const hash = (pw) => bcrypt.hashSync(pw, 10);
    db.prepare(
      `INSERT INTO users (name, email, password, role, walletBalance) VALUES (?,?,?,?,?)`
    ).run("Noori Admin", "admin@noori.travel", hash("Admin@123"), "ADMIN", 0);
    db.prepare(
      `INSERT INTO users (name, email, password, role, walletBalance, bookingLimit, accountLocked) VALUES (?,?,?,?,?,?,?)`
    ).run("Rabia Mutahir", "usamaumar106@gmail.com", hash("User@123"), "USER", 371299, 400000, 1);
  }
}
seedUsers();

// ---- Seed sample flights ----
function seedFlights() {
  const count = db.prepare("SELECT COUNT(*) as c FROM flights").get().c;
  if (count === 0) {
    const insert = db.prepare(`
      INSERT INTO flights
      (airlineName, airlineCode, flightNumber, packageType, originCity, originCode, destinationCity, destinationCode,
       departDate, departTime, arriveDate, arriveTime, duration, stops,
       returnDepartDate, returnDepartTime, returnArriveDate, returnArriveTime, returnDuration,
       returnOriginCity, returnOriginCode, returnDestinationCity, returnDestinationCode,
       class, meal, baggage, refundable, price, currency, supplier, seatsAvailable)
      VALUES (@airlineName,@airlineCode,@flightNumber,@packageType,@originCity,@originCode,@destinationCity,@destinationCode,
       @departDate,@departTime,@arriveDate,@arriveTime,@duration,@stops,
       @returnDepartDate,@returnDepartTime,@returnArriveDate,@returnArriveTime,@returnDuration,
       @returnOriginCity,@returnOriginCode,@returnDestinationCity,@returnDestinationCode,
       @class,@meal,@baggage,@refundable,@price,@currency,@supplier,@seatsAvailable)
    `);

    const sample = [
      {
        airlineName: "Fly Jinnah", airlineCode: "9P", flightNumber: "9P-700", packageType: "Umrah Package",
        originCity: "Islamabad", originCode: "ISB", destinationCity: "Jeddah", destinationCode: "JED",
        departDate: "2026-06-20", departTime: "06:40", arriveDate: "2026-06-20", arriveTime: "10:05",
        duration: "3h 25m", stops: 0,
        returnDepartDate: "2026-07-10", returnDepartTime: "11:05", returnArriveDate: "2026-07-10", returnArriveTime: "18:05",
        returnDuration: "7h 0m", returnOriginCity: "Jeddah", returnOriginCode: "JED",
        returnDestinationCity: "Islamabad", returnDestinationCode: "ISB",
        class: "Economy", meal: "No Meal", baggage: "20KG+7KG", refundable: 0,
        price: 237500, currency: "PKR", supplier: "AirArabia", seatsAvailable: 9,
      },
      {
        airlineName: "Saudi Arabian Airlines", airlineCode: "SV", flightNumber: "SV-732", packageType: "Umrah Package",
        originCity: "Lahore", originCode: "LHE", destinationCity: "Madina", destinationCode: "MED",
        departDate: "2026-06-13", departTime: "10:30", arriveDate: "2026-06-13", arriveTime: "13:35",
        duration: "3h 5m", stops: 0,
        returnDepartDate: "2026-06-17", returnDepartTime: "01:55", returnArriveDate: "2026-06-17", returnArriveTime: "08:40",
        returnDuration: "3h 45m", returnOriginCity: "Madina", returnOriginCode: "MED",
        returnDestinationCity: "Lahore", returnDestinationCode: "LHE",
        class: "Economy", meal: "Meal Included", baggage: "23KG+7KG", refundable: 0,
        price: 261500, currency: "PKR", supplier: "TravelPort", seatsAvailable: 5,
      },
      {
        airlineName: "Pakistan International Airlines", airlineCode: "PK", flightNumber: "PK-756", packageType: "Umrah Package",
        originCity: "Islamabad", originCode: "ISB", destinationCity: "Madina", destinationCode: "MED",
        departDate: "2026-06-13", departTime: "22:15", arriveDate: "2026-06-13", arriveTime: "01:30",
        duration: "3h 15m", stops: 0,
        returnDepartDate: "2026-06-17", returnDepartTime: "22:20", returnArriveDate: "2026-06-17", returnArriveTime: "05:30",
        returnDuration: "7h 10m", returnOriginCity: "Madina", returnOriginCode: "MED",
        returnDestinationCity: "Islamabad", returnDestinationCode: "ISB",
        class: "Economy", meal: "No Meal", baggage: "20KG+7KG", refundable: 0,
        price: 235000, currency: "PKR", supplier: "AirArabia", seatsAvailable: 7,
      },
      {
        airlineName: "Airblue", airlineCode: "PA", flightNumber: "PA-205", packageType: "Umrah Package",
        originCity: "Islamabad", originCode: "ISB", destinationCity: "Jeddah", destinationCode: "JED",
        departDate: "2026-06-13", departTime: "06:40", arriveDate: "2026-06-13", arriveTime: "10:05",
        duration: "3h 25m", stops: 0,
        returnDepartDate: "2026-06-17", returnDepartTime: "11:05", returnArriveDate: "2026-06-17", returnArriveTime: "18:05",
        returnDuration: "7h 0m", returnOriginCity: "Jeddah", returnOriginCode: "JED",
        returnDestinationCity: "Islamabad", returnDestinationCode: "ISB",
        class: "Economy", meal: "No Meal", baggage: "20KG+7KG", refundable: 0,
        price: 237500, currency: "PKR", supplier: "Fly Jinnah", seatsAvailable: 9,
      },
      {
        airlineName: "Saudia", airlineCode: "SV", flightNumber: "SV-758", packageType: "Umrah Package",
        originCity: "Islamabad", originCode: "ISB", destinationCity: "Jeddah", destinationCode: "JED",
        departDate: "2026-06-13", departTime: "10:35", arriveDate: "2026-06-13", arriveTime: "13:45",
        duration: "3h 10m", stops: 0,
        returnDepartDate: "2026-06-17", returnDepartTime: "18:10", returnArriveDate: "2026-06-17", returnArriveTime: "01:10",
        returnDuration: "7h 0m", returnOriginCity: "Jeddah", returnOriginCode: "JED",
        returnDestinationCity: "Islamabad", returnDestinationCode: "ISB",
        class: "Economy", meal: "Meal Included", baggage: "23KG+7KG", refundable: 0,
        price: 255000, currency: "PKR", supplier: "AirArabia", seatsAvailable: 4,
      },
      {
        airlineName: "Oman Air", airlineCode: "OV", flightNumber: "OV508", packageType: "Flight",
        originCity: "Sialkot", originCode: "SKT", destinationCity: "Muscat", destinationCode: "MCT",
        departDate: "2026-06-11", departTime: "22:05", arriveDate: "2026-06-12", arriveTime: "00:15",
        duration: "2h 10m", stops: 1,
        returnDepartDate: null, returnDepartTime: null, returnArriveDate: null, returnArriveTime: null,
        returnDuration: null, returnOriginCity: null, returnOriginCode: null,
        returnDestinationCity: null, returnDestinationCode: null,
        class: "Economy", meal: "No Meal", baggage: "20KG+7KG", refundable: 0,
        price: 104000, currency: "PKR", supplier: "GDS", seatsAvailable: 6,
      },
    ];

    const insertMany = db.transaction((rows) => {
      for (const r of rows) insert.run(r);
    });
    insertMany(sample);
  }
}
seedFlights();

// ---- Seed known airline names (no logos yet — admin uploads them from /admin/airlines) ----
function seedAirlines() {
  const count = db.prepare("SELECT COUNT(*) as c FROM airlines").get().c;
  if (count === 0) {
    const insert = db.prepare("INSERT OR IGNORE INTO airlines (name, code) VALUES (?, ?)");
    const names = db.prepare("SELECT DISTINCT airlineName, airlineCode FROM flights").all();
    const insertMany = db.transaction((rows) => {
      for (const r of rows) insert.run(r.airlineName, r.airlineCode);
    });
    insertMany(names);
  }
}
seedAirlines();

// ---- Seed sample company beneficiary accounts (for the Deposits feature) ----
function seedBeneficiaryAccounts() {
  const count = db.prepare("SELECT COUNT(*) as c FROM beneficiary_accounts").get().c;
  if (count === 0) {
    const insert = db.prepare(
      "INSERT INTO beneficiary_accounts (bankName, accountTitle, accountNumber) VALUES (?, ?, ?)"
    );
    insert.run("Meezan Bank", "Noori Travels", "6701107545469");
    insert.run("UBL - United Bank", "Noori Travels", "0109000207007109");
  }
}
seedBeneficiaryAccounts();

// Sum of a user's bookings that are still "active" (i.e. count against their limit).
// Cancelled / Rejected bookings free up the limit again.
export function getUsedLimit(userId) {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(totalFare),0) as used
       FROM bookings
       WHERE userId = ? AND status != 'Cancelled'`
    )
    .get(userId);
  return row.used;
}

// Creates an in-app notification for one user.
export function notify(userId, { title, message, link }) {
  db.prepare("INSERT INTO notifications (userId, title, message, link) VALUES (?, ?, ?, ?)").run(
    userId,
    title,
    message || null,
    link || null
  );
}

// Creates the same in-app notification for every admin account — used for events
// admins need to act on (new registration, payment/deposit needing approval, etc.)
export function notifyAdmins({ title, message, link }) {
  const admins = db.prepare("SELECT id FROM users WHERE role = 'ADMIN'").all();
  const insert = db.prepare("INSERT INTO notifications (userId, title, message, link) VALUES (?, ?, ?, ?)");
  const insertMany = db.transaction((rows) => {
    for (const a of rows) insert.run(a.id, title, message || null, link || null);
  });
  insertMany(admins);
}

export default db;
