import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import LandingPage from '@/app/page'

describe("Landing page", ()=> {
    test("Landing page navigation bar", () => {
    render(<LandingPage/>);

    expect(screen.getByRole("navigation")).toBeDefined();
    })
})
