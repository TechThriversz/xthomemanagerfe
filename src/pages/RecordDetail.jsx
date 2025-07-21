import { useState, useEffect } from 'react';
import {
    Typography, Grid, Card, CardContent, TextField, Button, Table, TableBody,
    TableCell, TableHead, TableRow, Box, Tabs, Tab
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useParams } from 'react-router-dom';
import { format, startOfMonth } from 'date-fns';
import { getRecords, getMilk, createMilk, getBills, createBill, getRent, createRent, getMilkAnalytics, getBillsAnalytics, getRentAnalytics } from '../services/api';

function RecordDetail({ user }) {
    const { recordId } = useParams();
    const [record, setRecord] = useState(null);
    const [milkData, setMilkData] = useState([]);
    const [billData, setBillData] = useState([]);
    const [rentData, setRentData] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [milkForm, setMilkForm] = useState({ quantityLiters: '', status: 'Bought', date: '' });
    const [billForm, setBillForm] = useState({ amount: '', referenceNumber: '', filePath: '', month: '' });
    const [rentForm, setRentForm] = useState({ amount: '', month: '' });
    const [error, setError] = useState('');
    const [tab, setTab] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()));

    useEffect(() => {
        fetchRecord();
        fetchData();
        fetchAnalytics();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [recordId, selectedMonth]);

    const fetchRecord = async () => {
        try {
            const res = await getRecords();
            const found = res.data.find(r => r.id == recordId);
            setRecord(found);
        } catch (err) {
            setError('Failed to fetch record');
        }
    };

    const fetchData = async () => {
        try {
            if (record?.type === 'Milk') {
                const res = await getMilk(recordId);
                setMilkData(res.data);
            } else if (record?.type === 'Bill') {
                const res = await getBills(recordId);
                setBillData(res.data);
            } else if (record?.type === 'Rent') {
                const res = await getRent(recordId);
                setRentData(res.data);
            }
        } catch (err) {
            setError('Failed to fetch data');
        }
    };

    const fetchAnalytics = async () => {
        try {
            const month = format(selectedMonth, 'yyyy-MM');
            if (record?.type === 'Milk') {
                const res = await getMilkAnalytics(recordId, month);
                setAnalytics(res.data);
            } else if (record?.type === 'Bill') {
                const res = await getBillsAnalytics(recordId, month);
                setAnalytics(res.data);
            } else if (record?.type === 'Rent') {
                const res = await getRentAnalytics(recordId, month);
                setAnalytics(res.data);
            }
        } catch (err) {
            setError('Failed to fetch analytics');
        }
    };

    const handleMilkSubmit = async (e) => {
        e.preventDefault();
        try {
            await createMilk({ ...milkForm, recordId, date: format(new Date(milkForm.date), 'yyyy-MM-dd') });
            fetchData();
            setMilkForm({ quantityLiters: '', status: 'Bought', date: '' });
        } catch (err) {
            setError('Failed to add milk');
        }
    };

    const handleBillSubmit = async (e) => {
        e.preventDefault();
        try {
            await createBill({ ...billForm, recordId, month: format(new Date(billForm.month), 'yyyy-MM') });
            fetchData();
            setBillForm({ amount: '', referenceNumber: '', filePath: '', month: '' });
        } catch (err) {
            setError('Failed to add bill');
        }
    };

    const handleRentSubmit = async (e) => {
        e.preventDefault();
        try {
            await createRent({ ...rentForm, recordId, month: format(new Date(rentForm.month), 'yyyy-MM') });
            fetchData();
            setRentForm({ amount: '', month: '' });
        } catch (err) {
            setError('Failed to add rent');
        }
    };

    if (!record) return <Typography>Loading...</Typography>;

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                <Typography variant="h4" gutterBottom>
                    {record.name} ({record.type}) - Created by {record.user?.fullName}
                </Typography>
                {error && <Alert severity="error">{error}</Alert>}
                {user.role === 'Admin' && (
                    <Grid container spacing={3} sx={{ mt: 2 }}>
                        {record.type === 'Milk' && (
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Add Milk Log</Typography>
                                        <form onSubmit={handleMilkSubmit}>
                                            <TextField
                                                label="Quantity (liters)"
                                                type="number"
                                                fullWidth
                                                margin="normal"
                                                value={milkForm.quantityLiters}
                                                onChange={(e) => setMilkForm({ ...milkForm, quantityLiters: e.target.value })}
                                                required
                                                disabled={milkForm.status === 'Leave'}
                                            />
                                            <TextField
                                                label="Status"
                                                select
                                                fullWidth
                                                margin="normal"
                                                value={milkForm.status}
                                                onChange={(e) => setMilkForm({ ...milkForm, status: e.target.value })}
                                                SelectProps={{ native: true }}
                                                required
                                            >
                                                <option value="Bought">Bought</option>
                                                <option value="Leave">Leave</option>
                                            </TextField>
                                            <TextField
                                                label="Date"
                                                type="date"
                                                fullWidth
                                                margin="normal"
                                                value={milkForm.date}
                                                onChange={(e) => setMilkForm({ ...milkForm, date: e.target.value })}
                                                InputLabelProps={{ shrink: true }}
                                                required
                                            />
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                sx={{ mt: 2 }}
                                            >
                                                Add Milk
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                        {record.type === 'Bill' && (
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Add Bill</Typography>
                                        <form onSubmit={handleBillSubmit}>
                                            <TextField
                                                label="Amount"
                                                type="number"
                                                fullWidth
                                                margin="normal"
                                                value={billForm.amount}
                                                onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                                                required
                                            />
                                            <TextField
                                                label="Reference Number"
                                                fullWidth
                                                margin="normal"
                                                value={billForm.referenceNumber}
                                                onChange={(e) => setBillForm({ ...billForm, referenceNumber: e.target.value })}
                                                required
                                            />
                                            <TextField
                                                label="File Path (optional)"
                                                fullWidth
                                                margin="normal"
                                                value={billForm.filePath}
                                                onChange={(e) => setBillForm({ ...billForm, filePath: e.target.value })}
                                            />
                                            <TextField
                                                label="Month"
                                                type="month"
                                                fullWidth
                                                margin="normal"
                                                value={billForm.month}
                                                onChange={(e) => setBillForm({ ...billForm, month: e.target.value })}
                                                InputLabelProps={{ shrink: true }}
                                                required
                                            />
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                sx={{ mt: 2 }}
                                            >
                                                Add Bill
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                        {record.type === 'Rent' && (
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Add Rent</Typography>
                                        <form onSubmit={handleRentSubmit}>
                                            <TextField
                                                label="Amount"
                                                type="number"
                                                fullWidth
                                                margin="normal"
                                                value={rentForm.amount}
                                                onChange={(e) => setRentForm({ ...rentForm, amount: e.target.value })}
                                                required
                                            />
                                            <TextField
                                                label="Month"
                                                type="month"
                                                fullWidth
                                                margin="normal"
                                                value={rentForm.month}
                                                onChange={(e) => setRentForm({ ...rentForm, month: e.target.value })}
                                                InputLabelProps={{ shrink: true }}
                                                required
                                            />
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                sx={{ mt: 2 }}
                                            >
                                                Add Rent
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                )}
                <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mt: 2 }}>
                    <Tab label="List View" />
                    <Tab label="Calendar View" />
                    <Tab label="Analytics" />
                </Tabs>
                {tab === 0 && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6">{record.type} Records</Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        {record.type === 'Milk' && (
                                            <>
                                                <TableCell>Quantity (liters)</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Rate/Liter (Rs)</TableCell>
                                                <TableCell>Total Cost (Rs)</TableCell>
                                                <TableCell>Date</TableCell>
                                            </>
                                        )}
                                        {record.type === 'Bill' && (
                                            <>
                                                <TableCell>Amount (Rs)</TableCell>
                                                <TableCell>Reference Number</TableCell>
                                                <TableCell>File Path</TableCell>
                                                <TableCell>Month</TableCell>
                                            </>
                                        )}
                                        {record.type === 'Rent' && (
                                            <>
                                                <TableCell>Amount (Rs)</TableCell>
                                                <TableCell>Month</TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {record.type === 'Milk' && milkData.map((milk) => (
                                        <TableRow key={milk.id}>
                                            <TableCell>{milk.id}</TableCell>
                                            <TableCell>{milk.quantityLiters}</TableCell>
                                            <TableCell>{milk.status}</TableCell>
                                            <TableCell>{milk.ratePerLiter}</TableCell>
                                            <TableCell>{milk.totalCost}</TableCell>
                                            <TableCell>{format(new Date(milk.date), 'yyyy-MM-dd')}</TableCell>
                                        </TableRow>
                                    ))}
                                    {record.type === 'Bill' && billData.map((bill) => (
                                        <TableRow key={bill.id}>
                                            <TableCell>{bill.id}</TableCell>
                                            <TableCell>{bill.amount}</TableCell>
                                            <TableCell>{bill.referenceNumber}</TableCell>
                                            <TableCell>{bill.filePath || 'N/A'}</TableCell>
                                            <TableCell>{bill.month}</TableCell>
                                        </TableRow>
                                    ))}
                                    {record.type === 'Rent' && rentData.map((rent) => (
                                        <TableRow key={rent.id}>
                                            <TableCell>{rent.id}</TableCell>
                                            <TableCell>{rent.amount}</TableCell>
                                            <TableCell>{rent.month}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
                {tab === 1 && (
                    <Card>
                        <CardContent>
                            <DatePicker
                                views={['year', 'month']}
                                label="Select Month"
                                value={selectedMonth}
                                onChange={(newValue) => setSelectedMonth(newValue)}
                            />
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        {record.type === 'Milk' && (
                                            <>
                                                <TableCell>Quantity (liters)</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Rate/Liter (Rs)</TableCell>
                                                <TableCell>Total Cost (Rs)</TableCell>
                                                <TableCell>Date</TableCell>
                                            </>
                                        )}
                                        {record.type === 'Bill' && (
                                            <>
                                                <TableCell>Amount (Rs)</TableCell>
                                                <TableCell>Reference Number</TableCell>
                                                <TableCell>File Path</TableCell>
                                                <TableCell>Month</TableCell>
                                            </>
                                        )}
                                        {record.type === 'Rent' && (
                                            <>
                                                <TableCell>Amount (Rs)</TableCell>
                                                <TableCell>Month</TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {record.type === 'Milk' && milkData
                                        .filter((milk) => format(new Date(milk.date), 'yyyy-MM') === format(selectedMonth, 'yyyy-MM'))
                                        .map((milk) => (
                                            <TableRow key={milk.id}>
                                                <TableCell>{milk.id}</TableCell>
                                                <TableCell>{milk.quantityLiters}</TableCell>
                                                <TableCell>{milk.status}</TableCell>
                                                <TableCell>{milk.ratePerLiter}</TableCell>
                                                <TableCell>{milk.totalCost}</TableCell>
                                                <TableCell>{format(new Date(milk.date), 'yyyy-MM-dd')}</TableCell>
                                            </TableRow>
                                        ))}
                                    {record.type === 'Bill' && billData
                                        .filter((bill) => bill.month === format(selectedMonth, 'yyyy-MM'))
                                        .map((bill) => (
                                            <TableRow key={bill.id}>
                                                <TableCell>{bill.id}</TableCell>
                                                <TableCell>{bill.amount}</TableCell>
                                                <TableCell>{bill.referenceNumber}</TableCell>
                                                <TableCell>{bill.filePath || 'N/A'}</TableCell>
                                                <TableCell>{bill.month}</TableCell>
                                            </TableRow>
                                        ))}
                                    {record.type === 'Rent' && rentData
                                        .filter((rent) => rent.month === format(selectedMonth, 'yyyy-MM'))
                                        .map((rent) => (
                                            <TableRow key={rent.id}>
                                                <TableCell>{rent.id}</TableCell>
                                                <TableCell>{rent.amount}</TableCell>
                                                <TableCell>{rent.month}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
                {tab === 2 && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6">{record.type} Analytics</Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Month</TableCell>
                                        {record.type === 'Milk' && (
                                            <>
                                                <TableCell>Total Quantity (liters)</TableCell>
                                                <TableCell>Total Cost (Rs)</TableCell>
                                                <TableCell>Bought Days</TableCell>
                                                <TableCell>Leave Days</TableCell>
                                            </>
                                        )}
                                        {record.type === 'Bill' && (
                                            <>
                                                <TableCell>Total Amount (Rs)</TableCell>
                                                <TableCell>Bill Count</TableCell>
                                            </>
                                        )}
                                        {record.type === 'Rent' && (
                                            <>
                                                <TableCell>Total Amount (Rs)</TableCell>
                                                <TableCell>Rent Count</TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {analytics.map((item) => (
                                        <TableRow key={item.month}>
                                            <TableCell>{item.month}</TableCell>
                                            {record.type === 'Milk' && (
                                                <>
                                                    <TableCell>{item.totalQuantity}</TableCell>
                                                    <TableCell>{item.totalCost}</TableCell>
                                                    <TableCell>{item.boughtDays}</TableCell>
                                                    <TableCell>{item.leaveDays}</TableCell>
                                                </>
                                            )}
                                            {record.type === 'Bill' && (
                                                <>
                                                    <TableCell>{item.totalAmount}</TableCell>
                                                    <TableCell>{item.billCount}</TableCell>
                                                </>
                                            )}
                                            {record.type === 'Rent' && (
                                                <>
                                                    <TableCell>{item.totalAmount}</TableCell>
                                                    <TableCell>{item.rentCount}</TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </LocalizationProvider>
    );
}

export default RecordDetail;