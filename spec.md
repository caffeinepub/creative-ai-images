# Specification

## Summary
**Goal:** Redeploy the existing AI Image Studio application (backend and frontend) in its current state so it is fully functional.

**Planned changes:**
- Redeploy the Motoko backend actor with Hugging Face HTTP outcalls
- Redeploy the React frontend with image generation form, display, and prompt history
- Ensure the charcoal+amber studio theme is preserved

**User-visible outcome:** The AI Image Studio loads without errors, the image generation form works with all fields, the backend responds to requests, and prompt history displays correctly with no "Not Found" or deployment errors.
