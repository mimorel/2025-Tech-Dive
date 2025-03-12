import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BoardDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        const fetchBoardDetails = async () => {
            try {
                const response = await fetch(`/api/boards/${id}`);
                if (!response.ok) throw new Error('Failed to fetch board details');
                const data = await response.json();
                setBoard(data);
                setFormData({ name: data.name, description: data.description });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBoardDetails();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/boards/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Failed to update board');
            const data = await response.json();
            setBoard(data);
            setEditMode(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/boards/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete board');
            navigate('/boards');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddPin = async (pinId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/boards/${id}/add-pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ pinId }),
            });
            if (!response.ok) throw new Error('Failed to add pin');
            const data = await response.json();
            setBoard(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemovePin = async (pinId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/boards/${id}/remove-pin/${pinId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to remove pin');
            const data = await response.json();
            setBoard(data);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="board-detail-container">
            {board && (
                <>
                    {editMode ? (
                        <form onSubmit={handleEdit}>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                            <button type="submit">Save Changes</button>
                        </form>
                    ) : (
                        <>
                            <h2>{board.name}</h2>
                            <p>{board.description}</p>
                            <button onClick={() => setEditMode(true)}>Edit</button>
                            <button onClick={handleDelete} className="delete-button">Delete</button>
                        </>
                    )}
                    <div className="pins-grid">
                        {board.pins.map(pin => (
                            <div key={pin._id} className="pin-card">
                                <img src={pin.imageUrl} alt={pin.title} />
                                <h3>{pin.title}</h3>
                                <button onClick={() => handleRemovePin(pin._id)}>Remove from Board</button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default BoardDetailPage;
