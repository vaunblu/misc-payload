import React, { useEffect, useState } from "react";
import { SelectInput } from "payload/components/forms";
import { Tenant, User } from "payload/generated-types";

type Option = {
  value: string;
  label: string;
};

export function TenantDropdown() {
  const [activeTenant, setActiveTenant] = useState("");
  const tenants = useTenants();
  const user = useUser();

  useEffect(() => {
    if (user && user.lastLoggedInTenant) {
      const lastLoggedInTenant = user.lastLoggedInTenant;

      if (typeof lastLoggedInTenant === "object") {
        setActiveTenant(lastLoggedInTenant.id);
      } else {
        setActiveTenant(lastLoggedInTenant);
      }
    }
  }, [user]);

  async function handleChange(tenant: string) {
    if (!user) return;

    try {
      const req = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lastLoggedInTenant: tenant,
        }),
      });
      const data = await req.json();
      console.log(data.docs);
    } catch (err) {
      console.log(err);
    }

    setActiveTenant(tenant);
    window.location.reload();
  }

  return (
    <>
      <p style={{ marginBottom: "10px" }}>Active Tenant</p>
      <div style={{ width: "100%" }}>
        <SelectInput
          value={activeTenant}
          name="activeTenant"
          path=""
          options={tenants.flatMap((tenant) => {
            return { value: tenant.id, label: tenant.name };
          })}
          onChange={(option: Option) => handleChange(option?.value ?? "")}
        />
      </div>
    </>
  );
}

function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    const getTenants = async () => {
      const tenants = await fetch(`/api/tenants`)
        .then((res) => res.json())
        .then((data) => data.docs);
      setTenants(tenants);
    };

    getTenants();
  }, []);

  return tenants;
}

function useUser() {
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    const getUser = async () => {
      const user = await fetch(`/api/users/me`).then((res) => res.json());
      setUser(user.user);
    };

    getUser();
  }, []);

  return user;
}
