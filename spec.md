# Specification

## Summary
**Goal:** Add Camera Angle, Lighting, Environment, and Composition parameter selectors to the image generation form, integrate them into prompt generation and preset save/load, and expand the negative prompt presets with a new "Comprehensive" option.

**Planned changes:**
- Add "Camera Angle" dropdown to ImageGenerationForm with options: Low Angle, High Angle, From Behind, Side View, Top-Down View, Close-Up, Full Body
- Add "Lighting" dropdown to ImageGenerationForm with options: Dramatic Lighting, Rim Lighting, Soft Shadows, Backlit, Volumetric Light, Dim Lighting, Neon Lighting
- Add "Environment" dropdown to ImageGenerationForm with options: Bedroom, Shower, Balcony, Forest, Studio, Night City, Rooftop
- Add "Composition" dropdown to ImageGenerationForm with options: Rule of Thirds, Centered, Sensual, Intimate, Dynamic, Artistic, Intricate Details
- Update `GenerationParams` type in App.tsx with `cameraAngle`, `lighting`, `environment`, and `composition` string fields
- Update prompt generation logic to include the four new parameters as descriptors when selected
- Add conditional badges for each new parameter in the ImageDisplay component
- Update `useSendQueries` mutation to pass the four new fields to the backend
- Update `PoseCriteria` type in `backend/main.mo` to include `cameraAngle`, `lighting`, `environment`, and `composition` Text fields
- Update `migration.mo` to default the four new fields to empty strings for existing records
- Add a "Comprehensive" negative prompt preset containing: bad anatomy, extra limbs, disfigured, deformed, blurry, low quality, watermark, text, bad hands
- Update preset save/load functionality to include the four new composition parameters

**User-visible outcome:** Users can select camera angle, lighting, environment, and composition settings when generating images; these selections are reflected in the generated prompt, shown as badges on the image display, and saved/restored with presets. A new "Comprehensive" negative prompt preset is also available.
