# Photos produits · prompts

Référence de style : `design/products/s1-graphite.png` (S1 Graphite).

## Méthode

- **Vélos** : ajouter `design/products/s1-graphite.png` en pièce jointe et demander une *modification* de l'image (Gemini ou ChatGPT).
  On garde ainsi exactement le même vélo, le même angle et la même lumière ; seule la finition change.
  C'est indispensable pour le configurateur : les photos doivent se superposer parfaitement.
- **Accessoires** : génération à partir du texte seul, dans la même conversation pour garder le même style.
- Format : 16:9 pour les vélos (2000 px de large minimum), 1:1 pour les accessoires (2048 × 2048).
- Déposer les images ici, dans `design/products/`, avec les noms indiqués.

---

## 1. Saqr S1 · Sand → `s1-sand.jpg`

> Use the attached image as the exact reference. Keep the same bike, the same camera angle and framing, the same copper-rimmed turntable, the same black studio background and the same lighting. Change only the frame and fork colour to a matte warm sand, like pale desert stone (around #C8B79A), with a fine satin finish. Keep the thin copper accent lines, the black tyres, black saddle, black grips and all black components unchanged. Photorealistic product photography, 16:9. No logos, no text, no watermark.

## 2. Saqr S1 · Copper → `s1-copper.jpg`

> Use the attached image as the exact reference. Keep the same bike, the same camera angle and framing, the same copper-rimmed turntable, the same black studio background and the same lighting. Change only the frame and fork to a deep satin brushed copper metallic (around #B4693E) with subtle anodised depth, and turn the thin accent lines to matte graphite. Keep the black tyres, black saddle, black grips and all black components unchanged. Photorealistic product photography, 16:9. No logos, no text, no watermark.

## 3. Saqr S1 Shaheen (édition limitée) → `s1-shaheen.jpg`

> Use the attached image as the exact reference. Keep the same bike shape, the same camera angle and framing, the same copper-rimmed turntable, the same black studio background and the same lighting. Turn it into a limited edition: deep gloss piano-black frame and fork, brushed copper details on the head tube band, the fork crown and the motor cover, copper-coloured rims, a hand-stitched cognac leather saddle with matching leather grips, and a small engraved copper plate on the head tube with no readable text. Luxurious but restrained. Photorealistic product photography, 16:9. No logos, no text, no watermark.

## 4. Saqr Lock → `lock.jpg`

> Premium compact folding bike lock made of hardened steel links, matte graphite finish with fine copper accents on the joints, shown folded and closed, lying on a black disc turntable with a thin glowing copper rim. A single copper key rests beside it. Pure black studio background, soft top light and a warm copper rim light, photorealistic product photography, square 1:1. No logos, no text, no watermark.

## 5. Leather Pannier → `pannier.jpg`

> Premium bicycle pannier bag in full-grain vegetable-tanned leather, rich cognac brown, clean minimal rectangular shape, two slim leather straps with brushed copper buckles, visible stitching, standing upright on a black disc turntable with a thin glowing copper rim, three-quarter view. Pure black studio background, soft top light and a warm copper rim light, photorealistic product photography, square 1:1. No logos, no text, no watermark.

## 6. Rapid Charger → `charger.jpg`

> Compact premium electric bike battery charger, a small rectangular block in matte graphite aluminium with fine cooling fins and one thin copper accent line, a braided black cable neatly coiled beside it ending in a round metal connector, placed on a black disc turntable with a thin glowing copper rim, three-quarter view. Pure black studio background, soft top light and a warm copper rim light, photorealistic product photography, square 1:1. No logos, no text, no watermark.

## 7. Gros plan Atelier (accueil, section « Made by hand ») → `atelier-drive.jpg`

Format vertical **4:5, 2048 × 2560** (1600 × 2000 minimum). Joindre `s1-copper.jpg` comme référence.

**A. Gros plan studio** (va avec la légende actuelle « 85 Nm mid-drive, sealed inside the frame ») :

> Use the attached image as the reference for the bike's design and finish. Create a close-up, vertical 4:5 product photograph of the same bike's mid-drive motor area: the bottom of the brushed copper down tube with the integrated battery, the black motor housing, the crank arm and the chainring, seen slightly from below at the level of the bottom bracket. Shallow depth of field, the motor in sharp focus, the rest of the frame softly falling into darkness. Pure black studio background, soft top light and a warm copper rim light along the tube edges. Photorealistic macro product photography, high detail on the metal textures and machined edges. No logos, no text, no watermark.

**B. Variante atelier (retenue)** · Gemini, avec `s1-copper.jpg` en pièce jointe. Légende prévue : « Every bolt torqued by hand ».

> Use the attached photo as the reference for the bike: same brushed copper frame, same black mid-drive motor housing, same thin graphite accent lines, same black crank and chainring. Do not redesign the bike.
>
> Create a new photograph, vertical portrait format 4:5, as tall as possible in resolution.
>
> Scene: a close-up in a dark, quiet bicycle workshop. A mechanic's two hands, sleeves rolled up on the forearms, tighten a bolt on the black motor housing with a slim matte black torque wrench. The camera is low, at the height of the bottom bracket, slightly from the side.
>
> In frame: only the hands and forearms, the torque wrench, the motor, the crank arm, the chainring and the lower part of the copper down tube. No face, no full bike, no wheels except maybe a blurred edge of a tyre.
>
> Light: a single warm workshop lamp from the upper left, deep black shadows, copper reflections along the edges of the frame, soft highlights on the knuckles. Shallow depth of field: the bolt, the wrench head and the fingers are sharp, the background falls into near-black darkness with a hint of a tool wall, completely out of focus.
>
> Style: photorealistic, high-end editorial photography, natural skin texture, anatomically correct hands with five fingers each, clean but not polished workshop feel.
>
> Strictly no logos, no brand names, no text or numbers on the tool, the motor or anywhere else, no watermark.

À vérifier : format 4:5 (sinon « Same image, but recompose it as a vertical 4:5 portrait. »), 1600 px de large minimum,
cinq doigts par main, aucun texte ni logo, pièces du vélo conformes à la photo jointe.

---

## Si le résultat dérive

- Le vélo change de forme : ajouter « Do not change the geometry, the components or the position of the bike. Only recolour. »
- Le fond n'est plus noir : ajouter « Background must stay pure black (#000000). »
- Du texte ou un logo apparaît : regénérer ; ne pas garder une image avec du texte inventé.
