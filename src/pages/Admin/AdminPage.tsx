import React, { useState } from "react";
import heroImage from "@/assets/hero-security.jpg";
import styles from "./AdminPage.module.css";
import Login from "./login";
import AdminHeader from "./header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className={styles.adminContainer}>
      <div className={styles.backgroundImage} style={{ backgroundImage: `url(${heroImage})` }}>
        <div className={styles.overlay} />
      </div>

      <div className={styles.container}>
        <div className={styles.maxWidth}>
          {isAuthenticated ? (
            <>
              <AdminHeader onLogout={() => setIsAuthenticated(false)} />
              <main>
               {/* <Card>
                  <CardHeader>
                    <CardTitle>  </CardTitle>
                  </CardHeader>
                  <CardContent>
                    
                  </CardContent>
                </Card> */}
              </main>
            </>
          ) : (
            <Login onLoginSuccess={() => setIsAuthenticated(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;