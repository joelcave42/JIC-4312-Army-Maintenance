import { useEffect, useState } from "react";

const UnapprovedAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("http://localhost:3000/api/v1/accounts/unapproved")
            .then((res) => res.json())
            .then((data) => {
                setAccounts(data.data || []); // Ensure it's an array
                setLoading(false);
            })
            .catch((error) => {
                setError("Failed to load accounts");
                setLoading(false);
            });
    }, []);

    // Allows supervisors to approve accounts
    const approveAccount = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/accounts/approve/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to approve account");
            }
    
            // Remove the approved account from the list dynamically
            setAccounts((prevAccounts) => prevAccounts.filter((account) => account._id !== userId));
    
        } catch (err) {
            setError(err.message);
        }
    };
    

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ padding: "20px" }}>
            <h2>Unapproved Accounts</h2>
            {accounts.length === 0 ? (
                <p>No unapproved accounts.</p>
            ) : (
                <table border="1" cellPadding="10">
                    <thead> {/* Fixed incorrect <thread> tag */}
                        <tr>
                            <th>Username</th>
                            <th>Account Type</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account) => (
                            <tr key={account._id}>
                                <td>{account.username}</td>
                                <td>{account.accountType}</td>
                                <td>
                                    <button
                                        style={{
                                            background: "#28a745",
                                            color: "#ffc317",
                                            padding: "6px 12px",
                                            border: "none",
                                            cursor: "pointer",
                                            borderRadius: "5px",
                                        }}
                                        onClick={() => approveAccount(account._id)}
                                    >
                                        Approve
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UnapprovedAccounts;
