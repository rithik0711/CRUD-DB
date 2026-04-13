const API = import.meta.env.VITE_API_URL;
import { useEffect, useState } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({ name: "", reg_no: "", dept: "", year: "", mail: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterDept, setFilterDept] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // table or cards
  const [stats, setStats] = useState({ total: 0, byDept: {}, byYear: {} });

  // Fetch all users
  useEffect(() => {
    getAllUsers();
  }, []);

  useEffect(() => {
    // Calculate statistics
    const deptCount = {};
    const yearCount = {};
    
    users.forEach(user => {
      deptCount[user.dept] = (deptCount[user.dept] || 0) + 1;
      yearCount[user.year] = (yearCount[user.year] || 0) + 1;
    });
    
    setStats({
      total: users.length,
      byDept: deptCount,
      byYear: yearCount
    });
  }, [users]);

  const getAllUsers = () => {
    setIsLoading(true);
    axios.get(`${API}/users`)
      .then(response => {
        console.log("Fetched Users:", response.data);
        setUsers(response.data);
        setFilteredUsers(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching users:", error);
        showNotification("Failed to fetch users", "error");
        setIsLoading(false);
      });
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Search function
  const handleSearchChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    setSearchTerm(searchText);
    applyFiltersAndSort(searchText, filterDept, filterYear, sortConfig);
  };

  // Filter functions
  const handleDeptFilter = (e) => {
    const dept = e.target.value;
    setFilterDept(dept);
    applyFiltersAndSort(searchTerm, dept, filterYear, sortConfig);
  };

  const handleYearFilter = (e) => {
    const year = e.target.value;
    setFilterYear(year);
    applyFiltersAndSort(searchTerm, filterDept, year, sortConfig);
  };

  // Sort function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    applyFiltersAndSort(searchTerm, filterDept, filterYear, { key, direction });
  };

  // Apply all filters and sorting
  const applyFiltersAndSort = (search, dept, year, sort) => {
    let filtered = [...users];
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(search) ||
        user.reg_no.toLowerCase().includes(search) ||
        user.dept.toLowerCase().includes(search) ||
        user.mail.toLowerCase().includes(search)
      );
    }
    
    // Apply department filter
    if (dept !== "all") {
      filtered = filtered.filter(user => user.dept === dept);
    }
    
    // Apply year filter
    if (year !== "all") {
      filtered = filtered.filter(user => user.year === year);
    }
    
    // Apply sorting
    if (sort.key) {
      filtered.sort((a, b) => {
        if (a[sort.key] < b[sort.key]) {
          return sort.direction === 'ascending' ? -1 : 1;
        }
        if (a[sort.key] > b[sort.key]) {
          return sort.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredUsers(filtered);
  };

  // Delete user function
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this user?");
    if (isConfirmed) {
      setIsLoading(true);
      try {
        await axios.delete(`${API}/users/${id}`);
        getAllUsers();
        showNotification("User deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting user:", error);
        showNotification("Failed to delete user", "error");
        setIsLoading(false);
      }
    }
  };

  // Open modal for editing
  const handleEdit = (user) => {
    console.log("Editing User:", user);
    setUserData({ ...user, id: user._id });
    setIsModalOpen(true);
  };

  // Open modal for inserting new user
  const handleInsert = () => {
    setUserData({ name: "", reg_no: "", dept: "", year: "", mail: "" });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle input changes
  const handleData = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Submit form (Insert/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (userData.id) {
        await axios.patch(`${API}/users/${userData.id}`, userData);
        showNotification("User updated successfully", "success");
      } else {
        await axios.post(`${API}/users`, userData);
        showNotification("User added successfully", "success");
      }

      setUserData({ name: "", reg_no: "", dept: "", year: "", mail: "" });
      setIsModalOpen(false);
      getAllUsers();
    } catch (error) {
      console.error("Error submitting user data:", error);
      showNotification("Failed to submit data", "error");
      setIsLoading(false);
    }
  };

  // Get unique departments for filter dropdown
  const getUniqueDepartments = () => {
    const depts = [...new Set(users.map(user => user.dept))];
    return depts;
  };

  // Get unique years for filter dropdown
  const getUniqueYears = () => {
    const years = [...new Set(users.map(user => user.year))];
    return years.sort();
  };

  return (
    <>
      <div className='app-container'>
        <div className="header">
          <div className="header-content">
            <div>
              <h1>Student Management System</h1>
              <p>Manage student records with ease</p>
            </div>
            <div className="header-stats">
              <div className="stat-card">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total Students</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className='controls-container'>
          <div className="search-filter-box">
            <div className="search-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input 
                type="search" 
                placeholder="Search students..." 
                value={searchTerm}
                onChange={handleSearchChange} 
              />
            </div>
            
            <div className="filter-group">
              <select 
                className="filter-select" 
                value={filterDept} 
                onChange={handleDeptFilter}
              >
                <option value="all">All Departments</option>
                {getUniqueDepartments().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              
              <select 
                className="filter-select" 
                value={filterYear} 
                onChange={handleYearFilter}
              >
                <option value="all">All Years</option>
                {getUniqueYears().map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="action-buttons">
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button 
                className={`view-btn ${viewMode === "cards" ? "active" : ""}`}
                onClick={() => setViewMode("cards")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="9"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </button>
            </div>
            <button className='btn-insert' onClick={handleInsert}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Student
            </button>
          </div>
        </div>
        
        {isLoading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading data...</p>
          </div>
        )}
        
        <div className="data-container">
          {filteredUsers.length > 0 ? (
            viewMode === "table" ? (
              <div className="table-wrapper">
                <table className='table'>
                  <thead>
                    <tr>
                      <th onClick={() => requestSort('name')} className="sortable">
                        Name
                        {sortConfig.key === 'name' && (
                          <span className="sort-indicator">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th onClick={() => requestSort('reg_no')} className="sortable">
                        Reg No
                        {sortConfig.key === 'reg_no' && (
                          <span className="sort-indicator">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th onClick={() => requestSort('dept')} className="sortable">
                        Department
                        {sortConfig.key === 'dept' && (
                          <span className="sort-indicator">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th onClick={() => requestSort('year')} className="sortable">
                        Year
                        {sortConfig.key === 'year' && (
                          <span className="sort-indicator">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th onClick={() => requestSort('mail')} className="sortable">
                        Email
                        {sortConfig.key === 'mail' && (
                          <span className="sort-indicator">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-info">
                            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td>{user.reg_no}</td>
                        <td><span className="dept-badge">{user.dept}</span></td>
                        <td><span className="year-badge">Year {user.year}</span></td>
                        <td>{user.mail}</td>
                        <td className="actions">
                          <button className='btn-edit' onClick={() => handleEdit(user)} title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button className='btn-delete' onClick={() => handleDelete(user._id)} title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="cards-container">
                {filteredUsers.map((user) => (
                  <div className="user-card" key={user._id}>
                    <div className="card-header">
                      <div className="user-avatar large">{user.name.charAt(0).toUpperCase()}</div>
                      <div className="card-actions">
                        <button className='btn-edit' onClick={() => handleEdit(user)} title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button className='btn-delete' onClick={() => handleDelete(user._id)} title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <h3>{user.name}</h3>
                      <p className="reg-no">{user.reg_no}</p>
                      <div className="card-details">
                        <div className="detail-item">
                          <span className="detail-label">Department</span>
                          <span className="dept-badge">{user.dept}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Year</span>
                          <span className="year-badge">Year {user.year}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Email</span>
                          <span className="email">{user.mail}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="no-data">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <p>No students found</p>
              <button className="btn-insert" onClick={handleInsert}>
                Add First Student
              </button>
            </div>
          )}
        </div>
        
        {isModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{userData.id ? "Edit Student" : "Add New Student"}</h2>
                <button className="close-btn" onClick={closeModal}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input 
                      type="text" 
                      id="name"
                      name="name" 
                      value={userData.name} 
                      onChange={handleData} 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="reg_no">Registration Number</label>
                    <input 
                      type="text" 
                      id="reg_no"
                      name="reg_no" 
                      value={userData.reg_no} 
                      onChange={handleData} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dept">Department</label>
                    <input 
                      type="text" 
                      id="dept"
                      name="dept" 
                      value={userData.dept} 
                      onChange={handleData} 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="year">Year</label>
                    <select 
                      id="year"
                      name="year" 
                      value={userData.year} 
                      onChange={handleData} 
                      required 
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="mail">Email Address</label>
                  <input 
                    type="email" 
                    id="mail"
                    name="mail" 
                    value={userData.mail} 
                    onChange={handleData} 
                    required 
                  />
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    {userData.id ? "Update" : "Add Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            <div className="notification-content">
              {notification.type === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
              {notification.type === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;