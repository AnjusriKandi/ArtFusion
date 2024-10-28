import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
    FaUser, FaPalette, FaPlus, FaNetworkWired, FaSearch, 
    FaCog, FaSignOutAlt, FaChevronDown, FaChevronUp 
} from 'react-icons/fa';
import { MdDelete } from "react-icons/md";
import './Dashboard.css';
import Create from './Create';
import DeleteAccountModal from './DeleteAccountModal'; 
import API from "../../api/axios";
function Dashboard() {
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/home');
    };

    const toggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
    };

    const openCreateModal = () => {
        setIsCreateOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateOpen(false);
    };

    const openDeleteModal = () => {
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
    };

    const handleDeleteAccount = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await API.delete('/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Assuming the response indicates success
            alert(response.data.message || 'Account deleted successfully');
            handleLogout(); // Log the user out after deletion
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Failed to delete account: ' + (error.response?.data?.message || 'Please try again later.'));
        } finally {
            closeDeleteModal();
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-brand-container">
                    <Link to="/" className="sidebar-brand">ARTFUSION</Link>
                </div>
                <div className="sidebar-menu">
                    <Link to="/dashboard/art-showcase" className="sidebar-link">
                        <FaPalette /> Art Showcase
                    </Link>
                    <Link to="/dashboard/search" className="sidebar-link">
                        <FaSearch /> Search
                    </Link>
                    <button className="sidebar-link" onClick={openCreateModal}>
                        <FaPlus /> Create
                    </button>
                    <Link to="/dashboard/resources" className="sidebar-link">
                        <FaNetworkWired /> Resources
                    </Link>
                    <Link to="/dashboard/events" className="sidebar-link">
                        <FaNetworkWired /> Event
                    </Link>
                    <Link to="/dashboard/profile" className="sidebar-link">
                        <FaUser /> Profile
                    </Link>
                </div>
                <div className="sidebar-more">
                    <div className="settings-section">
                        <button
                            className="sidebar-link"
                            onClick={toggleSettings}
                            aria-expanded={isSettingsOpen}
                            aria-controls="settings-submenu"
                        >
                            <FaCog /> Settings {isSettingsOpen ? <FaChevronUp style={{paddingLeft:7}}/> : <FaChevronDown style={{paddingLeft:7}}/>}
                        </button>
                        {isSettingsOpen && (
                            <div className="settings-submenu" id="settings-submenu">
                                <Link to="/dashboard/edit-profile" className="submenu-link">
                                    Edit Profile
                                </Link>
                                <button className="submenu-link logout-button" onClick={handleLogout}>
                                    Logout <FaSignOutAlt />
                                </button>
                                <button className="submenu-link logout-button" onClick={openDeleteModal}>
                                    Delete Account <MdDelete />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <main className="dashboard-content">
                <Outlet />
            </main>

            {/* Render the Create modal conditionally */}
            {isCreateOpen && <Create onClose={closeCreateModal} username="YourUsername" />}
            {/* Render the Delete Account modal conditionally */}
            {isDeleteModalOpen && (
                <DeleteAccountModal
                    onClose={closeDeleteModal}
                    onConfirm={handleDeleteAccount}
                    className='deleteAcoountModal'
                />
            )}
        </div>
    );
}

export default Dashboard;
