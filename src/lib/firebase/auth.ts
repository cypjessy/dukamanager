import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import { auth, db } from "./config";

export type UserRole = "developer" | "owner" | "manager" | "cashier" | "head_cashier" | "trainee" | "viewer";

export interface UserProfile {
  uid: string;
  email: string;
  shopId: string;
  role: UserRole;
  displayName?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  businessName: string;
  businessType: string;
  kraPin?: string;
  shopName: string;
  shopCategory: string;
  selectedPlan: "free" | "growth" | "enterprise";
  county?: string;
  town?: string;
}

// On signup, we create a new unique shopId for the tenant and save it.
export const registerUser = async (
  emailOrData: string | RegisterData,
  password?: string,
  shopName?: string
) => {
  try {
    let email: string;
    let pwd: string;
    let regData: RegisterData | null = null;

    if (typeof emailOrData === "object") {
      regData = emailOrData;
      email = regData.email;
      pwd = regData.password;
    } else {
      email = emailOrData;
      pwd = password!;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
    const user = userCredential.user;

    const shopId = `shop_${user.uid}`;
    const targetShopName = regData?.shopName || shopName!;

    // Store user data in a global `users` collection
    const userData: Record<string, unknown> = {
      email: user.email,
      shopId: shopId,
      role: "owner",
      isActive: true,
      createdAt: new Date().toISOString()
    };

    if (regData) {
      userData.displayName = regData.fullName;
      userData.phone = regData.phone || "";
      userData.businessName = regData.businessName;
      userData.businessType = regData.businessType;
      userData.kraPin = regData.kraPin || "";
      userData.county = regData.county || "";
      userData.town = regData.town || "";
      userData.selectedPlan = regData.selectedPlan;
    }

    await setDoc(doc(db, "users", user.uid), userData);

    // Create the initial shop document
    const shopData: Record<string, unknown> = {
      shopName: targetShopName,
      ownerId: user.uid,
      createdAt: new Date().toISOString()
    };

    if (regData) {
      shopData.category = regData.shopCategory;
      shopData.plan = regData.selectedPlan;
      shopData.currency = "KSh";
      shopData.timezone = "Africa/Nairobi";
    }

    await setDoc(doc(db, "shops", shopId), shopData);

    return { user, shopId };
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Fetch full user profile including role
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid,
        email: data.email,
        shopId: data.shopId,
        role: data.role || "cashier",
        displayName: data.displayName,
        phone: data.phone,
        isActive: data.isActive !== false,
        createdAt: data.createdAt,
        createdBy: data.createdBy
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

// Fetch shopId belonging to this user
export const getUserShopId = async (uid: string): Promise<string | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data()?.shopId || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user shop details:", error);
    return null;
  }
};

// Create a cashier account under a specific shop (only owner/manager can do this)
export const createCashierAccount = async (
  shopId: string,
  creatorUid: string,
  creatorRole: UserRole,
  cashierData: {
    email: string;
    password: string;
    displayName: string;
    phone?: string;
    role?: "cashier" | "manager" | "viewer";
  }
): Promise<UserProfile> => {
  // Verify creator has permission
  if (creatorRole !== "owner" && creatorRole !== "manager") {
    throw new Error("Only shop owners and managers can create user accounts");
  }

  // Managers can only create cashiers/viewers, not other managers
  if (creatorRole === "manager" && cashierData.role === "manager") {
    throw new Error("Managers cannot create manager accounts");
  }

  // Create the user in Firebase Auth using a secondary app to avoid signing out the current user
  const secondaryAppName = `secondary-${Date.now()}`;
  const { app: mainApp } = await import("./config");

  // Import firebase/app for secondary initialization and cleanup
  const { initializeApp: initApp, deleteApp } = await import("firebase/app");
  const { getAuth: getSecondaryAuth, createUserWithEmailAndPassword: createSecondaryUser } = await import("firebase/auth");

  // Create a secondary Firebase app instance
  const secondaryApp = initApp(mainApp.options, secondaryAppName);
  const secondaryAuth = getSecondaryAuth(secondaryApp);

  try {
    const userCredential = await createSecondaryUser(
      secondaryAuth,
      cashierData.email,
      cashierData.password
    );
    const newUser = userCredential.user;

    const targetRole = cashierData.role || "cashier";

    // Store user profile in Firestore
    await setDoc(doc(db, "users", newUser.uid), {
      email: cashierData.email,
      shopId: shopId,
      role: targetRole,
      displayName: cashierData.displayName,
      phone: cashierData.phone || "",
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: creatorUid
    });

    return {
      uid: newUser.uid,
      email: cashierData.email,
      shopId,
      role: targetRole,
      displayName: cashierData.displayName,
      phone: cashierData.phone,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: creatorUid
    };
  } finally {
    // Clean up secondary app
    await deleteApp(secondaryApp);
  }
};

// Get all users under a specific shop
export const getShopUsers = async (shopId: string): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("shopId", "==", shopId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email,
        shopId: data.shopId,
        role: data.role || "cashier",
        displayName: data.displayName,
        phone: data.phone,
        isActive: data.isActive !== false,
        createdAt: data.createdAt,
        createdBy: data.createdBy
      };
    });
  } catch (error) {
    console.error("Error fetching shop users:", error);
    return [];
  }
};

// Update a user's role (only owner can do this)
export const updateUserRole = async (
  targetUid: string,
  newRole: UserRole,
  updaterRole: UserRole
): Promise<void> => {
  if (updaterRole !== "owner") {
    throw new Error("Only shop owners can change user roles");
  }

  await updateDoc(doc(db, "users", targetUid), {
    role: newRole
  });
};

// Deactivate/activate a user account
export const setUserActiveStatus = async (
  targetUid: string,
  isActive: boolean,
  updaterRole: UserRole
): Promise<void> => {
  if (updaterRole !== "owner" && updaterRole !== "manager") {
    throw new Error("Only owners and managers can activate/deactivate accounts");
  }

  await updateDoc(doc(db, "users", targetUid), {
    isActive
  });
};

export const checkOwnerExists = async (): Promise<boolean> => {
  try {
    const q = query(collection(db, "users"), where("role", "==", "owner"));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch {
    return false;
  }
};

// Register a developer (platform admin) account
export const registerDeveloper = async (
  email: string,
  password: string,
  fullName: string,
  phone?: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      shopId: "",
      role: "developer",
      displayName: fullName,
      phone: phone || "",
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    return { user };
  } catch (error) {
    console.error("Error registering developer:", error);
    throw error;
  }
};
