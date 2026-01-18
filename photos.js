// photos.js - Progress Photos Management System - FIXED VERSION
console.log('📷 photos.js loaded');

let currentFolderId = 'root';
let currentEditingFolder = null;
let currentViewingPhoto = null;

const FOLDERS_KEY = 'progressPhotosFolders';
const PHOTOS_KEY = 'progressPhotos';

// Initialize photos system
function initializePhotos() {
    console.log('📷 Initializing photos system...');
    
    // Initialize data first
    initializePhotosData();
    
    // Event listeners for photos modal
    setupPhotosEventListeners();
    
    console.log('📷 Photos system initialized');
}

function setupPhotosEventListeners() {
    // Photos modal buttons
    const createFolderBtn = document.getElementById('createFolderBtn');
    const uploadPhotosBtn = document.getElementById('uploadPhotosBtn');
    const photoUploadInput = document.getElementById('photoUploadInput');
    const closePhotosModalBtn = document.getElementById('closePhotosModal');
    
    if (createFolderBtn) {
        createFolderBtn.addEventListener('click', openCreateFolderModal);
    }
    
    if (uploadPhotosBtn) {
        uploadPhotosBtn.addEventListener('click', triggerPhotoUpload);
    }
    
    if (photoUploadInput) {
        photoUploadInput.addEventListener('change', handlePhotoUpload);
    }
    
    if (closePhotosModalBtn) {
        closePhotosModalBtn.addEventListener('click', closePhotosModal);
    }
    
    // Create folder modal
    const closeCreateFolderModalBtn = document.getElementById('closeCreateFolderModal');
    const cancelCreateFolderBtn = document.getElementById('cancelCreateFolder');
    const confirmCreateFolderBtn = document.getElementById('confirmCreateFolder');
    const folderNameInput = document.getElementById('folderNameInput');
    
    if (closeCreateFolderModalBtn) {
        closeCreateFolderModalBtn.addEventListener('click', closeCreateFolderModal);
    }
    
    if (cancelCreateFolderBtn) {
        cancelCreateFolderBtn.addEventListener('click', closeCreateFolderModal);
    }
    
    if (confirmCreateFolderBtn) {
        confirmCreateFolderBtn.addEventListener('click', confirmCreateFolder);
    }
    
    if (folderNameInput) {
        folderNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                confirmCreateFolder();
            }
        });
    }
    
    // Photo viewer modal
    const closePhotoViewerModalBtn = document.getElementById('closePhotoViewerModal');
    const deletePhotoBtn = document.getElementById('deletePhotoBtn');
    
    if (closePhotoViewerModalBtn) {
        closePhotoViewerModalBtn.addEventListener('click', closePhotoViewerModal);
    }
    
    if (deletePhotoBtn) {
        deletePhotoBtn.addEventListener('click', deleteCurrentPhoto);
    }
    
    // Edit plan modal
    const closeEditModalBtn = document.getElementById('closeEditModal');
    if (closeEditModalBtn) {
        closeEditModalBtn.addEventListener('click', closeEditModal);
    }
    
    // Photos header button (in progressive page)
    const photosHeaderBtn = document.getElementById('photosHeaderBtn');
    if (photosHeaderBtn) {
        photosHeaderBtn.addEventListener('click', openPhotosModal);
    }
}

function updateCurrentFolderHighlight() {
    document.querySelectorAll('.folder-item').forEach(item => {
        item.classList.remove('current-folder');
    });
    
    const currentFolderItem = document.querySelector(`.folder-item[data-folder-id="${currentFolderId}"]`);
    if (currentFolderItem) {
        currentFolderItem.classList.add('current-folder');
    }
}

function initializePhotosData() {
    if (!localStorage.getItem(FOLDERS_KEY)) {
        const rootFolder = {
            id: 'root',
            name: 'Progress Photos',
            parentId: null,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(FOLDERS_KEY, JSON.stringify([rootFolder]));
    }
    
    if (!localStorage.getItem(PHOTOS_KEY)) {
        localStorage.setItem(PHOTOS_KEY, JSON.stringify([]));
    }
}

function openPhotosModal() {
    const modal = document.getElementById('photosModal');
    if (modal) {
        modal.style.display = 'flex';
        loadCurrentFolder();
    }
}

function closePhotosModal() {
    const modal = document.getElementById('photosModal');
    if (modal) {
        modal.style.display = 'none';
        currentFolderId = 'root';
    }
}

function loadCurrentFolder() {
    const folders = getFolders();
    const photos = getPhotos();
    
    updateBreadcrumb();
    displayFolders(folders.filter(folder => folder.parentId === currentFolderId));
    displayPhotos(photos.filter(photo => photo.folderId === currentFolderId));
    updateCurrentFolderHighlight();
}

function getFolders() {
    return JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]');
}

function getPhotos() {
    return JSON.parse(localStorage.getItem(PHOTOS_KEY) || '[]');
}

function saveFolders(folders) {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

function savePhotos(photos) {
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
}

function updateBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;
    
    breadcrumb.innerHTML = '';
    const path = getFolderPath(currentFolderId);
    
    path.forEach((folder, index) => {
        const breadcrumbItem = document.createElement('span');
        breadcrumbItem.className = 'breadcrumb-item';
        breadcrumbItem.textContent = folder.name;
        breadcrumbItem.dataset.folderId = folder.id;
        
        if (index < path.length - 1) {
            breadcrumbItem.style.cursor = 'pointer';
            breadcrumbItem.style.color = '#3498db';
            breadcrumbItem.addEventListener('click', () => navigateToFolder(folder.id));
        } else {
            breadcrumbItem.style.color = '#2c3e50';
            breadcrumbItem.style.fontWeight = 'bold';
        }
        
        breadcrumb.appendChild(breadcrumbItem);
        
        if (index < path.length - 1) {
            const separator = document.createElement('span');
            separator.textContent = ' › ';
            separator.style.margin = '0 8px';
            separator.style.color = '#7f8c8d';
            breadcrumb.appendChild(separator);
        }
    });
}

function getFolderPath(folderId) {
    const folders = getFolders();
    const path = [];
    let currentId = folderId;
    
    while (currentId) {
        const folder = folders.find(f => f.id === currentId);
        if (folder) {
            path.unshift(folder);
            currentId = folder.parentId;
        } else {
            break;
        }
    }
    
    return path;
}

function displayFolders(folders) {
    const grid = document.getElementById('foldersGrid');
    if (!grid) return;
    
    if (folders.length === 0) {
        grid.innerHTML = '<div class="no-items">No folders</div>';
        return;
    }
    
    grid.innerHTML = folders.map(folder => `
        <div class="folder-item" data-folder-id="${folder.id}">
            <div class="folder-icon">📁</div>
            <div class="folder-name">${folder.name}</div>
            <div class="folder-actions">
                <button class="icon-btn edit-folder-btn" data-folder-id="${folder.id}" title="Rename">✏️</button>
                <button class="icon-btn delete-folder-btn" data-folder-id="${folder.id}" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
    
    // Add click event to folders
    grid.querySelectorAll('.folder-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.folder-actions')) {
                navigateToFolder(item.dataset.folderId);
            }
        });
    });
    
    // Add event listeners to action buttons
    grid.querySelectorAll('.edit-folder-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            renameFolder(btn.dataset.folderId);
        });
    });
    
    grid.querySelectorAll('.delete-folder-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteFolder(btn.dataset.folderId);
        });
    });
}

function displayPhotos(photos) {
    const grid = document.getElementById('photosGrid');
    if (!grid) return;
    
    if (photos.length === 0) {
        grid.innerHTML = '<div class="no-items">No photos</div>';
        return;
    }
    
    grid.innerHTML = photos.map(photo => `
        <div class="photo-item" data-photo-id="${photo.id}">
            <img src="${photo.dataUrl}" alt="Progress Photo" class="photo-thumbnail">
            <div class="photo-overlay">
                <button class="icon-btn view-photo-btn" data-photo-id="${photo.id}" title="View">👁️</button>
                <button class="icon-btn delete-photo-btn" data-photo-id="${photo.id}" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to photo buttons
    grid.querySelectorAll('.view-photo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            viewPhoto(btn.dataset.photoId);
        });
    });
    
    grid.querySelectorAll('.delete-photo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deletePhoto(btn.dataset.photoId);
        });
    });
}

function navigateToFolder(folderId) {
    currentFolderId = folderId;
    loadCurrentFolder();
}

function openCreateFolderModal() {
    currentEditingFolder = null;
    const title = document.getElementById('createFolderTitle');
    const input = document.getElementById('folderNameInput');
    const modal = document.getElementById('createFolderModal');
    
    if (title) title.textContent = 'Create New Folder';
    if (input) {
        input.value = '';
        input.focus();
    }
    if (modal) modal.style.display = 'flex';
}

function closeCreateFolderModal() {
    const modal = document.getElementById('createFolderModal');
    if (modal) modal.style.display = 'none';
    currentEditingFolder = null;
}

function confirmCreateFolder() {
    const input = document.getElementById('folderNameInput');
    if (!input) return;
    
    const folderName = input.value.trim();
    if (!folderName) {
        showPhotoNotification('Please enter a folder name', 'error');
        return;
    }
    
    const folders = getFolders();
    
    // Check if we're editing an existing folder
    if (currentEditingFolder) {
        // EDIT EXISTING FOLDER
        const folderIndex = folders.findIndex(f => f.id === currentEditingFolder);
        if (folderIndex !== -1) {
            // Check for duplicate names (excluding the folder we're editing)
            const duplicate = folders.find(f => 
                f.id !== currentEditingFolder &&
                f.parentId === currentFolderId && 
                f.name.toLowerCase() === folderName.toLowerCase()
            );
            
            if (duplicate) {
                showPhotoNotification('A folder with this name already exists', 'error');
                return;
            }
            
            folders[folderIndex].name = folderName;
            saveFolders(folders);
            closeCreateFolderModal();
            loadCurrentFolder();
            showPhotoNotification('Folder renamed successfully!', 'success');
        }
    } else {
        // CREATE NEW FOLDER
        // Check for duplicate folder names in current folder
        const duplicate = folders.find(f => 
            f.parentId === currentFolderId && 
            f.name.toLowerCase() === folderName.toLowerCase()
        );
        
        if (duplicate) {
            showPhotoNotification('A folder with this name already exists', 'error');
            return;
        }
        
        const newFolder = {
            id: 'folder-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            name: folderName,
            parentId: currentFolderId,
            createdAt: new Date().toISOString()
        };
        
        folders.push(newFolder);
        saveFolders(folders);
        
        closeCreateFolderModal();
        loadCurrentFolder();
        showPhotoNotification('Folder created successfully!', 'success');
    }
}

function renameFolder(folderId) {
    const folders = getFolders();
    const folder = folders.find(f => f.id === folderId);
    
    if (!folder) return;
    
    currentEditingFolder = folderId;
    const title = document.getElementById('createFolderTitle');
    const input = document.getElementById('folderNameInput');
    const modal = document.getElementById('createFolderModal');
    
    if (title) title.textContent = 'Rename Folder';
    if (input) {
        input.value = folder.name;
        input.focus();
    }
    if (modal) modal.style.display = 'flex';
}

function deleteFolder(folderId) {
    if (folderId === 'root') {
        showPhotoNotification('Cannot delete root folder', 'error');
        return;
    }
    
    // Use dialog manager if available, otherwise use confirm
    if (window.dialogManager) {
        window.dialogManager.confirm({
            title: "Delete Folder",
            message: "Are you sure you want to delete this folder and all its contents?",
            details: "This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel",
            danger: true
        }).then(confirmed => {
            if (confirmed) {
                performFolderDeletion(folderId);
            }
        });
    } else if (confirm('Delete this folder and all its contents?')) {
        performFolderDeletion(folderId);
    }
}

function performFolderDeletion(folderId) {
    const folders = getFolders();
    const photos = getPhotos();
    
    // Recursively get all subfolders
    const foldersToDelete = getFolderTree(folderId);
    
    // Delete folders
    const updatedFolders = folders.filter(f => !foldersToDelete.includes(f.id));
    
    // Delete photos in these folders
    const updatedPhotos = photos.filter(photo => !foldersToDelete.includes(photo.folderId));
    
    saveFolders(updatedFolders);
    savePhotos(updatedPhotos);
    
    // If current folder is being deleted, go to parent
    if (foldersToDelete.includes(currentFolderId)) {
        const deletedFolder = folders.find(f => f.id === folderId);
        currentFolderId = deletedFolder.parentId || 'root';
    }
    
    loadCurrentFolder();
    showPhotoNotification('Folder deleted successfully!', 'success');
}

function getFolderTree(folderId) {
    const folders = getFolders();
    const tree = [folderId];
    
    function getSubfolders(parentId) {
        const subfolders = folders.filter(f => f.parentId === parentId);
        subfolders.forEach(folder => {
            tree.push(folder.id);
            getSubfolders(folder.id);
        });
    }
    
    getSubfolders(folderId);
    return tree;
}

function triggerPhotoUpload() {
    const input = document.getElementById('photoUploadInput');
    if (input) input.click();
}

function handlePhotoUpload(event) {
    const files = event.target.files;
    
    if (files.length === 0) return;
    
    const photos = getPhotos();
    let uploadCount = 0;
    let totalFiles = files.length;
    
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            showPhotoNotification(`File ${file.name} is not an image`, 'error');
            totalFiles--;
            return;
        }
        
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showPhotoNotification(`File ${file.name} is too large (max 5MB)`, 'error');
            totalFiles--;
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const newPhoto = {
                id: 'photo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                name: file.name,
                dataUrl: e.target.result,
                folderId: currentFolderId,
                uploadedAt: new Date().toISOString(),
                size: file.size,
                type: file.type
            };
            
            photos.push(newPhoto);
            uploadCount++;
            
            // Save after all files are processed
            if (uploadCount === totalFiles) {
                savePhotos(photos);
                loadCurrentFolder();
                showPhotoNotification(`${uploadCount} photo${uploadCount > 1 ? 's' : ''} uploaded successfully!`, 'success');
            }
        };
        
        reader.onerror = function() {
            showPhotoNotification(`Error reading file ${file.name}`, 'error');
            totalFiles--;
        };
        
        reader.readAsDataURL(file);
    });
    
    // Reset input
    event.target.value = '';
}

function viewPhoto(photoId) {
    const photos = getPhotos();
    const photo = photos.find(p => p.id === photoId);
    
    if (!photo) return;
    
    currentViewingPhoto = photoId;
    const viewerImage = document.getElementById('viewerImage');
    const viewerTitle = document.getElementById('photoViewerTitle');
    const modal = document.getElementById('photoViewerModal');
    
    if (viewerImage) viewerImage.src = photo.dataUrl;
    if (viewerTitle) viewerTitle.textContent = photo.name;
    if (modal) modal.style.display = 'flex';
}

function closePhotoViewerModal() {
    const modal = document.getElementById('photoViewerModal');
    if (modal) modal.style.display = 'none';
    currentViewingPhoto = null;
}

function deletePhoto(photoId) {
    // Use dialog manager if available
    if (window.dialogManager) {
        window.dialogManager.confirm({
            title: "Delete Photo",
            message: "Are you sure you want to delete this photo?",
            confirmText: "Delete",
            cancelText: "Cancel",
            danger: true
        }).then(confirmed => {
            if (confirmed) {
                performPhotoDeletion(photoId);
            }
        });
    } else if (confirm('Delete this photo?')) {
        performPhotoDeletion(photoId);
    }
}

function performPhotoDeletion(photoId) {
    const photos = getPhotos();
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    savePhotos(updatedPhotos);
    
    if (currentViewingPhoto === photoId) {
        closePhotoViewerModal();
    }
    
    loadCurrentFolder();
    showPhotoNotification('Photo deleted successfully!', 'success');
}

function deleteCurrentPhoto() {
    if (currentViewingPhoto) {
        deletePhoto(currentViewingPhoto);
    }
}

function closeEditModal() {
    const modal = document.getElementById('editPlanModal');
    if (modal) modal.style.display = 'none';
}

// FIXED: Separate notification function for photos to avoid recursive loop
function showPhotoNotification(message, type = 'info') {
    // Use your existing notification system if available
    if (window.showNotification && typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // Fallback notification (NOT RECURSIVE)
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 12px 20px;
        background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : '#3498db'};
        color: white; border-radius: 5px; z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📷 DOM loaded, setting up photos...');
    
    // Check if progressive page is visible
    const progressivePage = document.getElementById('progressive-page');
    if (progressivePage) {
        // Setup photos header button
        const photosHeaderBtn = document.getElementById('photosHeaderBtn');
        if (photosHeaderBtn) {
            photosHeaderBtn.addEventListener('click', openPhotosModal);
        }
    }
    
    // Also initialize if photos modal elements exist
    if (document.getElementById('photosModal')) {
        initializePhotos();
    }
});

// Make all functions globally available
window.initializePhotos = initializePhotos;
window.openPhotosModal = openPhotosModal;
window.closePhotosModal = closePhotosModal;
window.loadCurrentFolder = loadCurrentFolder;
window.navigateToFolder = navigateToFolder;
window.renameFolder = renameFolder;
window.deleteFolder = deleteFolder;
window.viewPhoto = viewPhoto;
window.deletePhoto = deletePhoto;
window.openCreateFolderModal = openCreateFolderModal;
window.triggerPhotoUpload = triggerPhotoUpload;