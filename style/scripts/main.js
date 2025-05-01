  // Array untuk menyimpan data stok
  let dataStok = [];
    
  // Array untuk menyimpan riwayat transaksi
  let riwayatTransaksi = [];
  
  // Total modal dan penjualan untuk menghitung keuntungan
  let totalModalKeseluruhan = 0;
  let totalPenjualanKeseluruhan = 0;
  
  // Navigasi Single Page Application
  document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Sembunyikan semua halaman
        const pages = document.querySelectorAll('.page-content');
        pages.forEach(page => {
          page.classList.remove('active');
        });
        
        // Tampilkan halaman yang dipilih
        const pageId = this.getAttribute('data-page');
        document.getElementById(pageId).classList.add('active');
      });
    });
    
    // Muat data dari local storage terlebih dahulu
    muatDataDariLocalStorage();
    
    // Kemudian perbarui tampilan
    updateTabelStok();
    updateTabelTransaksi();
    updateRingkasanKeuntungan();
  });
  
  // Fungsi untuk menyimpan data ke local storage
  function simpanDataKeLocalStorage() {
    localStorage.setItem('dataStok', JSON.stringify(dataStok));
    localStorage.setItem('riwayatTransaksi', JSON.stringify(riwayatTransaksi));
    localStorage.setItem('totalModalKeseluruhan', totalModalKeseluruhan);
    localStorage.setItem('totalPenjualanKeseluruhan', totalPenjualanKeseluruhan);
  }

  // Fungsi untuk memuat data dari local storage
  function muatDataDariLocalStorage() {
    // Cek apakah ada data yang tersimpan
    if (localStorage.getItem('dataStok')) {
      dataStok = JSON.parse(localStorage.getItem('dataStok'));
    }
    
    if (localStorage.getItem('riwayatTransaksi')) {
      riwayatTransaksi = JSON.parse(localStorage.getItem('riwayatTransaksi'));
    }
    
    if (localStorage.getItem('totalModalKeseluruhan')) {
      totalModalKeseluruhan = parseFloat(localStorage.getItem('totalModalKeseluruhan'));
    }
    
    if (localStorage.getItem('totalPenjualanKeseluruhan')) {
      totalPenjualanKeseluruhan = parseFloat(localStorage.getItem('totalPenjualanKeseluruhan'));
    }
  }
  
  // Fungsi untuk menampilkan form jual barang
  function showJualForm() {
    const jualForm = document.getElementById('jualForm');
    jualForm.style.display = 'block';
    
    // Perbarui daftar barang yang tersedia untuk dijual
    const barangJualSelect = document.getElementById('barangJual');
    barangJualSelect.innerHTML = '<option value="">-- Pilih Barang --</option>';
    
    dataStok.forEach(item => {
      const option = document.createElement('option');
      option.value = item.nama;
      option.textContent = `${item.nama} (Stok: ${item.jumlah})`;
      barangJualSelect.appendChild(option);
    });
  }
  
  // Fungsi untuk menyembunyikan form jual barang
  function hideJualForm() {
    document.getElementById('jualForm').style.display = 'none';
  }
  
  // Fungsi untuk menambah stok
  function tambahStok() {
    const namaBarang = document.getElementById('namaBarang').value;
    const jumlahBarang = parseInt(document.getElementById('jumlahBarang').value);
    const hargaModal = parseInt(document.getElementById('hargaModal').value);
    
    if (!namaBarang || !jumlahBarang || jumlahBarang <= 0 || !hargaModal || hargaModal <= 0) {
      alert('Mohon isi nama barang, jumlah, dan harga modal dengan benar!');
      return;
    }
    
    // Cek apakah barang sudah ada di stok
    const barangIndex = dataStok.findIndex(item => item.nama.toLowerCase() === namaBarang.toLowerCase());
    
    if (barangIndex !== -1) {
      // Jika barang sudah ada, hitung rata-rata tertimbang harga modal
      const stokLama = dataStok[barangIndex].jumlah;
      const modalLama = dataStok[barangIndex].hargaModal * stokLama;
      const modalBaru = hargaModal * jumlahBarang;
      const totalStok = stokLama + jumlahBarang;
      const rataRataModal = Math.round((modalLama + modalBaru) / totalStok);
      
      dataStok[barangIndex].jumlah = totalStok;
      dataStok[barangIndex].hargaModal = rataRataModal;
    } else {
      // Jika barang belum ada, tambahkan ke array
      dataStok.push({
        nama: namaBarang,
        jumlah: jumlahBarang,
        hargaModal: hargaModal
      });
    }
    
    // Catat transaksi
    const totalTransaksi = hargaModal * jumlahBarang;
    totalModalKeseluruhan += totalTransaksi;
    
    const transaksi = {
      waktu: new Date().toLocaleString(),
      nama: namaBarang,
      tipe: "Masuk",
      jumlah: jumlahBarang,
      harga: hargaModal,
      total: totalTransaksi
    };
    riwayatTransaksi.push(transaksi);
    
    // Simpan data ke local storage
    simpanDataKeLocalStorage();
    
    // Perbarui tampilan
    updateTabelStok();
    updateTabelTransaksi();
    updateRingkasanKeuntungan();
    
    // Reset form input
    document.getElementById('namaBarang').value = '';
    document.getElementById('jumlahBarang').value = '';
    document.getElementById('hargaModal').value = '';
    
    alert(`Berhasil menambah ${jumlahBarang} ${namaBarang} ke stok!`);
  }
  
  // Fungsi untuk menjual barang
  function jualBarang() {
    const namaBarang = document.getElementById('barangJual').value;
    const jumlahJual = parseInt(document.getElementById('jumlahJual').value);
    const hargaJual = parseInt(document.getElementById('hargaJual').value);
    
    if (!namaBarang || !jumlahJual || jumlahJual <= 0 || !hargaJual || hargaJual <= 0) {
      alert('Mohon isi semua field dengan benar!');
      return;
    }
    
    // Cek apakah barang ada di stok
    const barangIndex = dataStok.findIndex(item => item.nama === namaBarang);
    
    if (barangIndex === -1) {
      alert(`Barang ${namaBarang} tidak ditemukan dalam stok!`);
      return;
    }
    
    // Jika jumlah yang dijual lebih besar dari stok yang ada
    if (jumlahJual > dataStok[barangIndex].jumlah) {
      alert(`Stok ${namaBarang} tidak cukup! Stok saat ini: ${dataStok[barangIndex].jumlah}`);
      return;
    }
    
    const hargaModal = dataStok[barangIndex].hargaModal;
    const totalModal = hargaModal * jumlahJual;
    const totalJual = hargaJual * jumlahJual;
    const keuntungan = totalJual - totalModal;
    
    // Kurangi jumlah stok
    dataStok[barangIndex].jumlah -= jumlahJual;
    
    // Catat transaksi penjualan
    totalPenjualanKeseluruhan += totalJual;
    
    const transaksi = {
      waktu: new Date().toLocaleString(),
      nama: namaBarang,
      tipe: "Keluar (Jual)",
      jumlah: jumlahJual,
      harga: hargaJual,  // Harga jual (bukan modal)
      total: totalJual
    };
    riwayatTransaksi.push(transaksi);
    
    // Jika stok menjadi 0, hapus dari daftar
    if (dataStok[barangIndex].jumlah === 0) {
      dataStok.splice(barangIndex, 1);
    }
    
    // Simpan data ke local storage
    simpanDataKeLocalStorage();
    
    // Perbarui tampilan
    updateTabelStok();
    updateTabelTransaksi();
    updateRingkasanKeuntungan();
    hideJualForm();
    
    // Reset form input
    document.getElementById('barangJual').value = '';
    document.getElementById('jumlahJual').value = '';
    document.getElementById('hargaJual').value = '';
    
    alert(`Penjualan berhasil!\nKeuntungan: ${formatRupiah(keuntungan)}`);
  }
  
  // Fungsi untuk memformat angka sebagai mata uang Rupiah
  function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  }
  
  // Fungsi untuk memperbarui tampilan tabel stok
  function updateTabelStok() {
    const tabelStokBody = document.querySelector('#tabelStok tbody');
    if (!tabelStokBody) return; // Jika elemen belum tersedia
    
    tabelStokBody.innerHTML = '';
    
    if (dataStok.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="5" style="text-align: center;">Tidak ada stok barang.</td>';
      tabelStokBody.appendChild(row);
      return;
    }
    
    dataStok.forEach((item, index) => {
      const totalModal = item.jumlah * item.hargaModal;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.nama}</td>
        <td>${item.jumlah}</td>
        <td>${formatRupiah(item.hargaModal)}</td>
        <td>${formatRupiah(totalModal)}</td>
      `;
      tabelStokBody.appendChild(row);
    });
  }
  
  // Fungsi untuk memperbarui tampilan tabel transaksi
  function updateTabelTransaksi() {
    const tabelTransaksiBody = document.querySelector('#tabelTransaksi tbody');
    if (!tabelTransaksiBody) return; // Jika elemen belum tersedia
    
    tabelTransaksiBody.innerHTML = '';
    
    if (riwayatTransaksi.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="6" style="text-align: center;">Belum ada transaksi.</td>';
      tabelTransaksiBody.appendChild(row);
      return;
    }
    
    // Tampilkan 10 transaksi terbaru
    const transaksiBaru = riwayatTransaksi.slice(-10).reverse();
    
    transaksiBaru.forEach(transaksi => {
      const row = document.createElement('tr');
      // Beri warna berbeda untuk transaksi masuk dan keluar
      const rowClass = transaksi.tipe.includes('Jual') ? 'background-color: #e6ffe6;' : '';
      
      row.innerHTML = `
        <td style="${rowClass}">${transaksi.waktu}</td>
        <td style="${rowClass}">${transaksi.nama}</td>
        <td style="${rowClass}">${transaksi.tipe}</td>
        <td style="${rowClass}">${transaksi.jumlah}</td>
        <td style="${rowClass}">${formatRupiah(transaksi.harga)}</td>
        <td style="${rowClass}">${formatRupiah(transaksi.total)}</td>
      `;
      tabelTransaksiBody.appendChild(row);
    });
  }
  
  // Fungsi untuk memperbarui ringkasan keuntungan
  function updateRingkasanKeuntungan() {
    const totalModal = document.getElementById('totalModal');
    const totalPenjualan = document.getElementById('totalPenjualan');
    const totalKeuntungan = document.getElementById('totalKeuntungan');
    
    if (!totalModal || !totalPenjualan || !totalKeuntungan) return; // Jika elemen belum tersedia
    
    const keuntungan = totalPenjualanKeseluruhan - totalModalKeseluruhan;
    
    totalModal.textContent = formatRupiah(totalModalKeseluruhan);
    totalPenjualan.textContent = formatRupiah(totalPenjualanKeseluruhan);
    totalKeuntungan.textContent = formatRupiah(keuntungan);
  }

  // Fungsi untuk mereset semua data
function resetData() {
  // Konfirmasi pengguna sebelum menghapus data
  if (confirm("Apakah Anda yakin ingin mereset semua data? Semua data stok, transaksi, dan laporan keuangan akan dihapus.")) {
    // Reset array data dan variabel total
    dataStok = [];
    riwayatTransaksi = [];
    totalModalKeseluruhan = 0;
    totalPenjualanKeseluruhan = 0;
    
    // Hapus data dari localStorage
    localStorage.removeItem('dataStok');
    localStorage.removeItem('riwayatTransaksi');
    localStorage.removeItem('totalModalKeseluruhan');
    localStorage.removeItem('totalPenjualanKeseluruhan');
    
    // Perbarui tampilan tabel
    updateTabelStok();
    updateTabelTransaksi();
    updateRingkasanKeuntungan();
    
    alert("Data berhasil direset!");
  }
}

/// Fungsi untuk mengekspor data ke file PDF
function exportData() {
  // Perlu memastikan library jsPDF sudah dimuat
  if (typeof jsPDF === 'undefined') {
    // Jika jsPDF tidak tersedia, tambahkan scriptnya
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = function() {
      const scriptAutoTable = document.createElement('script');
      scriptAutoTable.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
      scriptAutoTable.onload = generatePDF;
      document.body.appendChild(scriptAutoTable);
    };
    document.body.appendChild(script);
  } else {
    generatePDF();
  }
  
  function generatePDF() {
    // Buat tanggal untuk nama file
    const tanggal = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    const waktu = new Date().toLocaleTimeString('id-ID').replace(/:/g, '-');
    const namaFile = `LeniCell_Laporan_${tanggal}_${waktu}`;
    
    // Inisialisasi jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Tambahkan judul
    doc.setFontSize(18);
    doc.text('Laporan Data Leni Cell', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Tanggal: ${tanggal} ${waktu}`, 105, 22, { align: 'center' });
    
    // Tambahkan data stok
    doc.setFontSize(14);
    doc.text('Data Stok Barang', 14, 35);
    
    if (dataStok.length > 0) {
      // Buat data untuk tabel stok
      const stokHeaders = [['No', 'Nama Barang', 'Jumlah', 'Harga Modal', 'Total Modal']];
      const stokData = dataStok.map((item, index) => {
        const totalModal = item.jumlah * item.hargaModal;
        return [
          index + 1,
          item.nama,
          item.jumlah,
          formatRupiah(item.hargaModal).replace('Rp\xa0', ''),
          formatRupiah(totalModal).replace('Rp\xa0', '')
        ];
      });
      
      // Buat tabel stok
      doc.autoTable({
        startY: 40,
        head: stokHeaders,
        body: stokData,
        theme: 'striped',
        headStyles: { fillColor: [255, 153, 0] }
      });
    } else {
      doc.text('Tidak ada stok barang.', 14, 40);
    }
    
    // Tambahkan riwayat transaksi
    const currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 40;
    doc.setFontSize(14);
    doc.text('Riwayat Transaksi', 14, currentY);
    
    if (riwayatTransaksi.length > 0) {
      // Ambil 10 transaksi terbaru
      const recentTransactions = riwayatTransaksi.slice(-10).reverse();
      
      // Buat data untuk tabel transaksi
      const transaksiHeaders = [['Waktu', 'Nama Barang', 'Tipe', 'Jumlah', 'Harga', 'Total']];
      const transaksiData = recentTransactions.map(transaksi => {
        return [
          transaksi.waktu,
          transaksi.nama,
          transaksi.tipe,
          transaksi.jumlah,
          formatRupiah(transaksi.harga).replace('Rp\xa0', ''),
          formatRupiah(transaksi.total).replace('Rp\xa0', '')
        ];
      });
      
      // Buat tabel transaksi
      doc.autoTable({
        startY: currentY + 5,
        head: transaksiHeaders,
        body: transaksiData,
        theme: 'striped',
        headStyles: { fillColor: [255, 153, 0] }
      });
    } else {
      doc.text('Belum ada transaksi.', 14, currentY + 5);
    }
    
    // Tambahkan ringkasan keuntungan
    const keuntunganY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : currentY + 10;
    doc.setFontSize(14);
    doc.text('Ringkasan Keuntungan', 14, keuntunganY);
    
    // Buat data untuk tabel ringkasan
    const keuntunganHeaders = [['Total Modal', 'Total Penjualan', 'Total Keuntungan']];
    const keuntungan = totalPenjualanKeseluruhan - totalModalKeseluruhan;
    const keuntunganData = [[
      formatRupiah(totalModalKeseluruhan).replace('Rp\xa0', ''),
      formatRupiah(totalPenjualanKeseluruhan).replace('Rp\xa0', ''),
      formatRupiah(keuntungan).replace('Rp\xa0', '')
    ]];
    
    // Buat tabel ringkasan
    doc.autoTable({
      startY: keuntunganY + 5,
      head: keuntunganHeaders,
      body: keuntunganData,
      theme: 'striped',
      headStyles: { fillColor: [255, 153, 0] }
    });
    
    // Tambahkan footer
    const footerY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : keuntunganY + 15;
    doc.setFontSize(10);
    doc.text('Laporan ini dihasilkan secara otomatis dari aplikasi Leni Cell Inventory Management System.', 105, footerY, { align: 'center' });
    
    // Simpan PDF
    doc.save(`${namaFile}.pdf`);
    
    alert(`Data berhasil diekspor ke file "${namaFile}.pdf"`);
  }
}

// Fungsi untuk menampilkan menu hapus
function tampilMenuHapus() {
  document.getElementById('modalHapus').style.display = 'block';
  const modalContent = document.getElementById('modalHapusContent');
  
  modalContent.innerHTML = `
    <h3>Menu Hapus Data</h3>
    <p>Pilih kategori data yang ingin dihapus:</p>
    <div class="menu-hapus">
      <button onclick="tampilHapusStok()" class="btn-menu">Hapus Item Stok</button>
      <button onclick="tampilHapusTransaksi()" class="btn-menu">Hapus Riwayat Transaksi</button>
      <button onclick="resetKategori('keuntungan')" class="btn-menu">Reset Data Keuntungan</button>
      <button onclick="resetSemuaData()" class="btn-delete">Reset Semua Data</button>
    </div>
    <button onclick="tutupModal('modalHapus')" class="btn-secondary mt-10">Tutup</button>
  `;
}

// Fungsi untuk menampilkan modal hapus stok
function tampilHapusStok() {
  document.getElementById('modalStok').style.display = 'block';
  const modalContent = document.getElementById('modalStokContent');
  
  // Reset konten modal
  modalContent.innerHTML = '<h3>Hapus Item Stok</h3>';
  
  if (dataStok.length === 0) {
    modalContent.innerHTML += '<p>Tidak ada item stok untuk dihapus.</p>';
    modalContent.innerHTML += '<button onclick="tutupModal(\'modalStok\')" class="btn-secondary">Tutup</button>';
    return;
  }
  
  // Buat daftar stok dengan tombol hapus
  const stokList = document.createElement('ul');
  stokList.className = 'list-hapus';
  
  dataStok.forEach((item, index) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <span>${item.nama} (Stok: ${item.jumlah})</span>
      <button onclick="hapusItemStok(${index})" class="btn-delete">Hapus</button>
    `;
    stokList.appendChild(listItem);
  });
  
  modalContent.appendChild(stokList);
  modalContent.innerHTML += '<button onclick="tutupModal(\'modalStok\')" class="btn-secondary mt-10">Tutup</button>';
}

// Fungsi untuk menampilkan modal hapus transaksi
function tampilHapusTransaksi() {
  document.getElementById('modalTransaksi').style.display = 'block';
  const modalContent = document.getElementById('modalTransaksiContent');
  
  // Reset konten modal
  modalContent.innerHTML = '<h3>Hapus Riwayat Transaksi</h3>';
  
  if (riwayatTransaksi.length === 0) {
    modalContent.innerHTML += '<p>Tidak ada riwayat transaksi untuk dihapus.</p>';
    modalContent.innerHTML += '<button onclick="tutupModal(\'modalTransaksi\')" class="btn-secondary">Tutup</button>';
    return;
  }
  
  // Tambahkan tombol hapus semua
  modalContent.innerHTML += `
    <button onclick="hapusSemuaTransaksi()" class="btn-delete mb-10">Hapus Semua Transaksi</button>
    <p>Atau pilih transaksi yang ingin dihapus:</p>
  `;
  
  // Buat daftar transaksi dengan tombol hapus
  const transaksiList = document.createElement('ul');
  transaksiList.className = 'list-hapus';
  
  // Tampilkan 10 transaksi terbaru
  const recentTransactions = riwayatTransaksi.slice(-10).reverse();
  
  recentTransactions.forEach((transaksi, idx) => {
    const actualIndex = riwayatTransaksi.length - 1 - idx;
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <span>${transaksi.waktu}: ${transaksi.nama} (${transaksi.tipe}) - ${formatRupiah(transaksi.total)}</span>
      <button onclick="hapusTransaksi(${actualIndex})" class="btn-delete">Hapus</button>
    `;
    transaksiList.appendChild(listItem);
  });
  
  modalContent.appendChild(transaksiList);
  modalContent.innerHTML += '<button onclick="tutupModal(\'modalTransaksi\')" class="btn-secondary mt-10">Tutup</button>';
}

// Fungsi untuk menutup modal
function tutupModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Fungsi untuk menghapus item stok berdasarkan index
function hapusItemStok(index) {
  if (confirm(`Apakah Anda yakin ingin menghapus ${dataStok[index].nama} dari stok?`)) {
    // Hapus item dari array dataStok
    dataStok.splice(index, 1);
    
    // Simpan data ke local storage
    simpanDataKeLocalStorage();
    
    // Perbarui tampilan
    updateTabelStok();
    
    // Tutup modal dan tampilkan ulang daftar stok
    tutupModal('modalStok');
    tampilHapusStok();
    
    alert('Item stok berhasil dihapus!');
  }
}

// Fungsi untuk menghapus transaksi berdasarkan index
function hapusTransaksi(index) {
  const transaksi = riwayatTransaksi[index];
  
  if (confirm(`Apakah Anda yakin ingin menghapus transaksi ${transaksi.nama} (${transaksi.tipe}) - ${formatRupiah(transaksi.total)}?`)) {
    // Perbarui total modal atau penjualan keseluruhan berdasarkan tipe transaksi
    if (transaksi.tipe === "Masuk") {
      totalModalKeseluruhan -= transaksi.total;
    } else if (transaksi.tipe === "Keluar (Jual)") {
      totalPenjualanKeseluruhan -= transaksi.total;
    }
    
    // Hapus transaksi dari array
    riwayatTransaksi.splice(index, 1);
    
    // Simpan data ke local storage
    simpanDataKeLocalStorage();
    
    // Perbarui tampilan
    updateTabelTransaksi();
    updateRingkasanKeuntungan();
    
    // Tutup modal dan tampilkan ulang daftar transaksi
    tutupModal('modalTransaksi');
    tampilHapusTransaksi();
    
    alert('Transaksi berhasil dihapus!');
  }
}

// Fungsi untuk menghapus semua transaksi
function hapusSemuaTransaksi() {
  if (confirm('Apakah Anda yakin ingin menghapus SEMUA riwayat transaksi? Tindakan ini tidak dapat dibatalkan.')) {
    // Reset riwayat transaksi dan data keuangan
    riwayatTransaksi = [];
    totalModalKeseluruhan = 0;
    totalPenjualanKeseluruhan = 0;
    
    // Simpan data ke local storage
    simpanDataKeLocalStorage();
    
    // Perbarui tampilan
    updateTabelTransaksi();
    updateRingkasanKeuntungan();
    
    // Tutup modal
    tutupModal('modalTransaksi');
    
    alert('Semua riwayat transaksi berhasil dihapus!');
  }
}

// Fungsi untuk mereset kategori data tertentu
function resetKategori(kategori) {
  if (kategori === 'keuntungan') {
    if (confirm('Apakah Anda yakin ingin mereset data keuntungan? Tindakan ini akan menghapus semua data penjualan dan modal.')) {
      // Reset data keuntungan tetapi pertahankan data stok
      totalModalKeseluruhan = 0;
      totalPenjualanKeseluruhan = 0;
      
      // Simpan data ke local storage
      simpanDataKeLocalStorage();
      
      // Perbarui tampilan
      updateRingkasanKeuntungan();
      
      // Tutup modal
      tutupModal('modalHapus');
      
      alert('Data keuntungan berhasil direset!');
    }
  }
}

// Fungsi untuk mereset semua data
function resetSemuaData() {
  if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset SEMUA data? Semua data stok, transaksi, dan laporan keuangan akan dihapus. Tindakan ini tidak dapat dibatalkan.')) {
    // Reset array data dan variabel total
    dataStok = [];
    riwayatTransaksi = [];
    totalModalKeseluruhan = 0;
    totalPenjualanKeseluruhan = 0;
    
    // Hapus data dari localStorage
    localStorage.removeItem('dataStok');
    localStorage.removeItem('riwayatTransaksi');
    localStorage.removeItem('totalModalKeseluruhan');
    localStorage.removeItem('totalPenjualanKeseluruhan');
    
    // Perbarui tampilan tabel
    updateTabelStok();
    updateTabelTransaksi();
    updateRingkasanKeuntungan();
    
    // Tutup modal
    tutupModal('modalHapus');
    
    alert('Semua data berhasil direset!');
  }
}

// Tambahkan event listener untuk tombol hapus pada tampilan stok dan transaksi
document.addEventListener('DOMContentLoaded', function() {
  // Menangani tombol hapus di menu utama
  const btnHapus = document.getElementById('btnHapus');
  if (btnHapus) {
    btnHapus.addEventListener('click', tampilMenuHapus);
  }
});
