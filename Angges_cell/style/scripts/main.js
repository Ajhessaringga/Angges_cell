// Smooth scroll ke anchor link
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();

    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Contoh event saat klik tombol "Hubungi Kami"
document.addEventListener("DOMContentLoaded", function () {
  const contactBtn = document.querySelector('.btn');

  if (contactBtn) {
    contactBtn.addEventListener('click', function (e) {
      e.preventDefault();
      alert("Terima kasih telah menghubungi Angges Cell! Kami akan segera menghubungi Anda.");
    });
  }
});


// ===============================
// 🚀 Tambahan Fungsi Pengolahan Stok
// ===============================
let stokBarang = {};

function renderStok() {
  const daftar = document.getElementById("daftarStok");
  if (!daftar) return;

  daftar.innerHTML = "";
  for (let nama in stokBarang) {
    const jumlah = stokBarang[nama];
    const li = document.createElement("li");
    li.textContent = `${nama}: ${jumlah} unit`;
    daftar.appendChild(li);
  }
}

function tambahStok() {
  const nama = document.getElementById("namaBarang").value.trim();
  const jumlah = parseInt(document.getElementById("jumlahBarang").value);

  if (nama && jumlah > 0) {
    stokBarang[nama] = (stokBarang[nama] || 0) + jumlah;
    renderStok();
    resetForm();
  } else {
    alert("Masukkan nama dan jumlah barang yang valid.");
  }
}

function kurangiStok() {
  const nama = document.getElementById("namaBarang").value.trim();
  const jumlah = parseInt(document.getElementById("jumlahBarang").value);

  if (nama && jumlah > 0 && stokBarang[nama] && stokBarang[nama] >= jumlah) {
    stokBarang[nama] -= jumlah;
    renderStok();
    resetForm();
  } else {
    alert("Data tidak valid atau stok tidak mencukupi.");
  }
}

function resetForm() {
  document.getElementById("namaBarang").value = "";
  document.getElementById("jumlahBarang").value = "";
}

// Render awal jika user sudah mengisi sebelumnya (future-proof)
document.addEventListener("DOMContentLoaded", renderStok);
