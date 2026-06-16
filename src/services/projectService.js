import { db } from '../firebase';
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

const COLLECTION_NAME = 'projects';

/**
 * Fetches all projects from Firestore sorted by creation date.
 * Returns them so every visitor sees the same cloud-stored list.
 */
export async function fetchProjects() {
  try {
    const projectsCol = collection(db, COLLECTION_NAME);
    const q = query(projectsCol, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  } catch (error) {
    console.error('Error fetching projects from Firestore:', error);
    throw error;
  }
}

/**
 * Adds a brand new project to Firestore (sets the creation timestamp
 * so ordering stays stable).
 */
export async function addProject(project) {
  try {
    const projectId = project.id || `proj-${Date.now()}`;
    const docRef = doc(db, COLLECTION_NAME, projectId);
    const finalData = {
      title: project.title || '',
      description: project.description || '',
      tech: project.tech || [],
      features: project.features || [],
      link: project.link || '#',
      createdAt: serverTimestamp()
    };

    const firestoreTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore save timed out. Check database rules!')), 10000)
    );

    await Promise.race([setDoc(docRef, finalData), firestoreTimeout]);

    return { id: projectId, ...finalData };
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
}

/**
 * Updates an existing project. Uses merge so the original createdAt
 * (and therefore the display order) is preserved.
 */
export async function updateProject(project) {
  try {
    const docRef = doc(db, COLLECTION_NAME, project.id);
    const finalData = {
      title: project.title || '',
      description: project.description || '',
      tech: project.tech || [],
      features: project.features || [],
      link: project.link || '#'
    };

    const firestoreTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore update timed out. Check database rules!')), 10000)
    );

    await Promise.race([setDoc(docRef, finalData, { merge: true }), firestoreTimeout]);

    return { id: project.id, ...finalData };
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

/**
 * Deletes a project from Firestore.
 */
export async function deleteProject(projectId) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, projectId));
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

/**
 * Migrates projects that only existed in localStorage into Firestore once,
 * skipping any that are already in the cloud.
 */
export async function migrateProjectsFromLocalStorage(localProjects) {
  if (!localProjects || localProjects.length === 0) return;

  try {
    const existing = await fetchProjects();
    const existingIds = new Set(existing.map(p => p.id));

    for (const project of localProjects) {
      if (!existingIds.has(project.id)) {
        console.log(`Migrating project: ${project.title}`);
        await addProject(project);
      }
    }
    console.log('Project localStorage migration completed successfully!');
  } catch (error) {
    console.error('Error migrating projects:', error);
  }
}
