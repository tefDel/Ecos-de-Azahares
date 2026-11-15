/* Materiales compartidos. THREE llega como variable global (script clásico en el HTML). */

/* Materiales que cambian de color según el "mood" (0 = gris, 1 = dorado).
   Se registran con T(material, colorGris, colorDorado). */
export const tint = [];
export const T = (mat, gray, gold) => {
  tint.push([mat, new THREE.Color(gray), new THREE.Color(gold)]);
  return mat;
};

/* Material plano que ignora la luz */
export const basic = (color, opts) => new THREE.MeshBasicMaterial(Object.assign({ color }, opts));
