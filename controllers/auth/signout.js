// signout.js

export const SignoutUser = (req, res) => {
  // Menghapus cookie jwt dengan mengatur expire date-nya ke tanggal 1 Januari 1970
  res.cookie("jwt", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: false, // Ubah dari 'security' menjadi 'secure'
  });

  // Memberikan respons bahwa signout berhasil dengan status 200
  res.status(200).json({ message: "Signout Successfully" });
};
