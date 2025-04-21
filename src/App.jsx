import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "productos"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await addDoc(collection(db, "productos"), {
      nombre: newItem.trim(),
      necesarios: 0,
      enCasa: 0,
      actualizadoPor: "Sin nombre",
      actualizadoEn: serverTimestamp(),
    });
    setNewItem("");
  };

  const handleChange = async (id, field, value) => {
    const itemRef = doc(db, "productos", id);
    const item = items.find((item) => item.id === id);
    await updateDoc(itemRef, {
      ...item,
      [field]: Number(value),
      actualizadoEn: serverTimestamp(),
    });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "productos", id));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🛒 Lista de la compra</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="Añadir producto..."
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
          Añadir
        </button>
      </div>
      <table className="w-full bg-white rounded shadow text-sm">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Producto</th>
            <th className="p-2">Necesarios</th>
            <th className="p-2">En casa</th>
            <th className="p-2">Comprar</th>
            <th className="p-2">Última actualización</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const comprar = Math.max(0, item.necesarios - item.enCasa);
            const fecha = item.actualizadoEn?.toDate?.().toLocaleString() || "—";
            return (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.nombre}</td>
                <td className="p-2">
                  <input
                    type="number"
                    value={item.necesarios}
                    onChange={(e) => handleChange(item.id, "necesarios", e.target.value)}
                    className="w-16 p-1 border rounded"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={item.enCasa}
                    onChange={(e) => handleChange(item.id, "enCasa", e.target.value)}
                    className="w-16 p-1 border rounded"
                  />
                </td>
                <td className="p-2 font-bold">{comprar}</td>
                <td className="p-2 text-xs text-gray-500">{fecha}</td>
                <td className="p-2">
                  <button onClick={() => handleDelete(item.id)} className="text-red-600">🗑️</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;