import { describe, expect, test } from 'vitest';
import request from "supertest";
import app from "../../app.js"

describe("POST /api/v1/subscriptions", ()=>{
    test("Create new subscription", async () => {
        const agent = request.agent(app);

        await agent.post("/api/v1/auth/sign-in").send({email: "antonioiulianionica@gmail.com", password: "qweasdzxc"})

        const res = await agent.post("/api/v1/subscriptions").send({
            name: "Netflix new subscription",
            price: 12,
            frequency: "daily",
            category: "house",
            paymentMethod: "credit card",
            startDate: "2026-02-12T00:00:00.000+00:00",
            user: "6a60510cc3b6a3d358ec44fd"
        });

        console.log("SUB: " + res.status);

        expect(res.status).toBe(201);
        expect(res.body.data.subscription.name).toBe("Netflix new subscription");
    });
});