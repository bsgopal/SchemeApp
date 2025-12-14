import db from "../config/db.js";

function now() {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
}




export const getWallet = async (req, res) => {
    try {
        const { userId } = req.params;

        const [rows] = await db.execute(
            "SELECT balance, gold_grams FROM wallet WHERE user_id=?",
            [userId]
        );

        if (rows.length === 0) {
            await db.execute("INSERT INTO wallet (user_id) VALUES (?)", [userId]);
            return res.json({ success: true, balance: 0, gold: 0 });
        }

        res.json({
            success: true,
            balance: rows[0].balance,
            gold: rows[0].gold_grams,
        });
    } catch (err) {
        console.error("❌ getWallet:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};


export const addMoneyToWallet = async (req, res) => {
    let conn;
    try {
        const { userId, amount } = req.body;

        conn = await db.getConnection();
        await conn.beginTransaction();

        // create wallet if missing
        await conn.execute(
            "INSERT IGNORE INTO wallet (user_id, balance, gold_grams) VALUES (?,0,0)",
            [userId]
        );

        // update balance
        await conn.execute(
            "UPDATE wallet SET balance = balance + ? WHERE user_id=?",
            [amount, userId]
        );

        // create transaction record
        await conn.execute(
            `INSERT INTO wallet_transactions 
   (user_id, type, amount, created_at)
   VALUES (?, 'add_money', ?, ?)`,
            [userId, amount, now()]
        );


        await conn.commit();

        res.json({
            success: true,
            message: "Money added to wallet",
        });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error("❌ addMoneyToWallet:", err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
};


export const convertCashToGold = async (req, res) => {
    let conn;

    try {
        const { userId, amount } = req.body;

        conn = await db.getConnection();
        await conn.beginTransaction();

        // get gold rate
        const [rateRow] = await conn.execute("SELECT goldRate FROM rates WHERE id=1");
        if (!rateRow.length) throw new Error("Gold rate not set");

        const goldRate = rateRow[0].goldRate;

        const grams = amount / goldRate;

        // check wallet balance
        const [wallet] = await conn.execute(
            "SELECT balance FROM wallet WHERE user_id=?",
            [userId]
        );

        if (!wallet.length || wallet[0].balance < amount)
            throw new Error("Insufficient wallet balance");

        // deduct money
        await conn.execute(
            "UPDATE wallet SET balance = balance - ?, gold_grams = gold_grams + ? WHERE user_id=?",
            [amount, grams, userId]
        );

        // record transaction
        await conn.execute(
            `INSERT INTO wallet_transactions (user_id, type, amount, gold_grams, created_at)
       VALUES (?, 'convert', ?, ?, ?)`,
            [userId, amount, grams, now()]
        );

        await conn.commit();

        res.json({
            success: true,
            message: "Converted successfully",
            grams,
            goldRate,
        });

    } catch (err) {
        if (conn) await conn.rollback();
        console.error("❌ convertCashToGold:", err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
};


export const payInstallmentWithWallet = async (req, res) => {
    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        const { userId, membership_id } = req.body;

        // get next installment
        const [next] = await conn.execute(
            `SELECT installment_no, amount FROM installments 
       WHERE membership_id=? AND status='pending'
       ORDER BY installment_no ASC LIMIT 1`,
            [membership_id]
        );

        if (!next.length) throw new Error("No pending installments");

        const instNo = next[0].installment_no;
        const amount = next[0].amount;

        // Check wallet balance
        const [wallet] = await conn.execute(
            "SELECT balance FROM wallet WHERE user_id=?",
            [userId]
        );

        if (!wallet.length || wallet[0].balance < amount)
            throw new Error("Insufficient wallet balance");

        // get gold rate
        const [rateRow] = await conn.execute(
            "SELECT goldRate FROM rates WHERE id=1"
        );

        const goldRate = rateRow[0].goldRate;
        const grams = amount / goldRate;

        const nowTime = now();
        const receiptNo = `WALLET-${Date.now()}-${Math.floor(Math.random() * 999)}`;

        // create scheme payment
        const [p] = await conn.execute(
            `INSERT INTO scheme_payments 
       (receipt_no, receipt_date, membership_id, receipt_type, amount,
        mode_primary, status, created_at, inst_no, gold_rate, grams, customer_user_id)
       VALUES (?, ?, ?, 'wallet', ?, 'wallet', 'completed', ?, ?, ?, ?, ?)`,
            [
                receiptNo,
                nowTime,
                membership_id,
                amount,
                nowTime,
                instNo,
                goldRate,
                grams,
                userId
            ]
        );

        // deduct wallet balance
        await conn.execute(
            "UPDATE wallet SET balance = balance - ? WHERE user_id=?",
            [amount, userId]
        );

        // mark installment paid
        await conn.execute(
            `UPDATE installments
       SET status='paid', paid_date=?, last_modified=? 
       WHERE membership_id=? AND installment_no=?`,
            [nowTime, nowTime, membership_id, instNo]
        );

        // log wallet transaction
        await conn.execute(
            `INSERT INTO wallet_transactions (user_id, type, amount, created_at)
       VALUES (?, 'wallet_payment', ?, ?)`,
            [userId, amount, nowTime]
        );

        await conn.commit();

        res.json({
            success: true,
            message: "Installment paid from wallet",
            payment_id: p.insertId,
            installment: instNo,
            goldRate,
            grams
        });

    } catch (err) {
        if (conn) await conn.rollback();
        console.error("❌ payInstallmentWithWallet:", err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (conn) conn.release();
    }
};


export const getWalletHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        const [rows] = await db.execute(
            `SELECT * FROM wallet_transactions 
       WHERE user_id=? ORDER BY created_at DESC`,
            [userId]
        );

        res.json({ success: true, history: rows });
    } catch (err) {
        console.error("❌ getWalletHistory:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
