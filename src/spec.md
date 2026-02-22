# Specification

## Summary
**Goal:** Add Stable Diffusion negative prompt presets to the image generation form.

**Planned changes:**
- Add a negative prompt preset dropdown selector to the ImageGenerationForm with at least 5 preset options (e.g., 'Low Quality', 'Anatomical Issues', 'Artifacts', 'Default Safe', 'None')
- Define negative prompt text values for each preset containing appropriate Stable Diffusion keywords
- Update the PoseCriteria type in the backend to include a negativePrompt field
- Update prompt generation logic to append the selected negative prompt preset text to the comprehensive prompt with clear separation
- Add a negative prompt preset badge to the ImageDisplay component alongside existing parameter badges
- Update the useSendQueries mutation hook to pass the negativePrompt parameter to the backend
- Create a migration.mo file to handle upgrading existing PoseCriteria records with default values

**User-visible outcome:** Users can select a negative prompt preset from a dropdown when generating images, see the preset displayed as a badge in the results, and have the negative prompt included in the generated comprehensive prompt.
