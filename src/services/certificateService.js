import { db, storage } from '../firebase';
import {
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  uploadString, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

const COLLECTION_NAME = 'certificates';

// Categories used to group certificates into separate carousels.
// The first entry is the fallback for any certificate without a category.
export const CERT_CATEGORIES = [
  { id: 'participation', label: 'Participation', icon: '🏆' },
  { id: 'internship', label: 'Internship', icon: '💼' },
  { id: 'courses', label: 'Courses', icon: '📚' },
];

export const DEFAULT_CATEGORY = CERT_CATEGORIES[0].id;

/**
 * Fetches all certificates from Firestore sorted by creation date.
 */
export async function fetchCertificates() {
  try {
    const certsCol = collection(db, COLLECTION_NAME);
    const q = query(certsCol, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    const certs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return certs;
  } catch (error) {
    console.error('Error fetching certificates from Firestore:', error);
    throw error;
  }
}

async function uploadToStorage(path, fileOrData) {
  console.log(`Starting upload to storage: ${path}`);
  const storageRef = ref(storage, path);
  
  const uploadPromise = async () => {
    if (fileOrData instanceof File) {
      console.log(`Uploading File object...`);
      await uploadBytes(storageRef, fileOrData);
    } else if (typeof fileOrData === 'string' && fileOrData.startsWith('data:')) {
      console.log(`Uploading Base64 string...`);
      await uploadString(storageRef, fileOrData, 'data_url');
    } else {
      console.log(`Returning existing URL...`);
      return fileOrData;
    }
    return await getDownloadURL(storageRef);
  };

  // Add a 15-second timeout
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error(`Storage upload timed out for ${path}. Check Storage rules or Adblocker!`)), 15000)
  );

  const url = await Promise.race([uploadPromise(), timeoutPromise]);
  console.log(`Upload complete! URL: ${url.substring(0, 50)}...`);
  return url;
}

/**
 * Deletes a file from Firebase Storage if it's hosted there.
 */
async function deleteFromStorage(fileUrl) {
  if (!fileUrl) return;
  try {
    // Only delete if it belongs to our Firebase storage
    if (fileUrl.includes('firebasestorage.googleapis.com')) {
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
    }
  } catch (error) {
    console.error('Error deleting file from storage:', fileUrl, error);
  }
}

/**
 * Adds a new certificate (metadata + files) to Firebase.
 */
export async function addCertificate(certData, imageFile, certFile) {
  try {
    const certId = certData.id || `cert-${Date.now()}`;
    let imageUrl = certData.image || '';
    let pdfUrl = certData.certificateUrl || '';

    // We are bypassing Firebase Storage because it requires a billing account.
    // Instead, we will save the base64 strings directly into Firestore!
    // Firestore has a 1MB document limit, so we enforce smaller file sizes in the Editor.
    
    // The imageUrl and pdfUrl are already base64 strings from the Editor.
    // We just pass them directly to Firestore.

    // 3. Save to Firestore
    console.log('Saving metadata to Firestore database...');
    const docRef = doc(db, COLLECTION_NAME, certId);
    const finalData = {
      title: certData.title,
      issuer: certData.issuer,
      date: certData.date,
      category: certData.category || DEFAULT_CATEGORY,
      image: imageUrl,
      certificateUrl: pdfUrl,
      createdAt: serverTimestamp()
    };
    
    // Add a 10-second timeout for Firestore
    const firestoreTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore save timed out. Check database rules!')), 10000)
    );
    
    await Promise.race([setDoc(docRef, finalData), firestoreTimeout]);
    console.log('Firestore save complete!');
    
    return {
      id: certId,
      ...finalData
    };
  } catch (error) {
    console.error('Error adding certificate:', error);
    throw error;
  }
}

/**
 * Updates just the category of an existing certificate (merge update, so
 * the createdAt / display order is preserved).
 */
export async function updateCertificateCategory(certId, category) {
  try {
    const docRef = doc(db, COLLECTION_NAME, certId);
    await updateDoc(docRef, { category });
  } catch (error) {
    console.error('Error updating certificate category:', error);
    throw error;
  }
}

/**
 * Deletes a certificate from Firestore and removes its associated storage assets.
 */
export async function deleteCertificate(certId, imageUrl, certificateUrl) {
  try {
    // 1. Delete Firestore Document
    const docRef = doc(db, COLLECTION_NAME, certId);
    await deleteDoc(docRef);

    // 2. We don't need to delete from Storage anymore since we bypassed it.
    // The data is deleted automatically when the Firestore document is deleted!
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw error;
  }
}

/**
 * Migrates existing certificates from localStorage to Firebase once.
 */
export async function migrateCertsFromLocalStorage(localCerts) {
  if (!localCerts || localCerts.length === 0) return;
  
  try {
    // Get existing ones to avoid duplicate uploads
    const existingCerts = await fetchCertificates();
    const existingIds = new Set(existingCerts.map(c => c.id));

    for (const cert of localCerts) {
      if (!existingIds.has(cert.id)) {
        console.log(`Migrating certificate: ${cert.title}`);
        // Add to Firebase (this will automatically upload base64 images/PDFs if present)
        await addCertificate(cert, null, null);
      }
    }
    console.log('LocalStorage migration completed successfully!');
  } catch (error) {
    console.error('Error migrating certificates:', error);
  }
}
