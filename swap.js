import wallet from "./handle.js";

const swap = async (px) => {
  const { account, web3, privateKey } = await wallet(px);

  const UNISWAP_V3_ROUTER = "0xbD2C3F0E65eDF5582141C35969d66e34629cC768";
  const tokenIn = "0x9A87C2412d500343c073E5Ae5394E3bE3874F76b";
  const tokenOut = "0xce830D0905e0f7A9b300401729761579c5FB6bd6";
  const fee = 3000;

  // Jumlah token yang ingin ditukar
  const amountIn = web3.utils.toWei("1", "ether"); // Misalnya 1 tokenIn
  const amountOutMinimum = "519158593219287"; // Angka dari MetaMask (sesuaikan jika perlu)

  // Fungsi Approve
  const approve = async () => {
    const contractABI = [
      {
        inputs: [
          { name: "_spender", type: "address" },
          { name: "_value", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];
    const contract = new web3.eth.Contract(contractABI, tokenIn);
    const maxUint256 =
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

    const data = contract.methods
      .approve(UNISWAP_V3_ROUTER, maxUint256)
      .encodeABI();
    const tx = {
      from: account.address,
      to: tokenIn,
      data: data,
      nonce: Number(
        await web3.eth.getTransactionCount(account.address, "pending")
      ),
      gas: Math.floor(
        Number(
          await web3.eth.estimateGas({
            from: account.address,
            to: tokenIn,
            data: data,
          })
        ) * 1.2
      ),
      gasPrice: Math.floor(
        Number(await web3.eth.getGasPrice()) * 1.1
      ).toString(),
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    console.log("Approve Success:", receipt.transactionHash);
    return receipt;
  };

  const getApprove = await approve();
  if (!getApprove) {
    return { message: "Failed to approve" };
  }

  // ABI yang sesuai dengan Uniswap V3 Router
  const abiSwap = [
    {
      inputs: [
        {
          internalType: "address",
          name: "tokenIn",
          type: "address",
        },
        {
          internalType: "address",
          name: "tokenOut",
          type: "address",
        },
        {
          internalType: "uint24",
          name: "fee",
          type: "uint24",
        },
        {
          internalType: "address",
          name: "recipient",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "deadline",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "amountIn",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "amountOutMinimum",
          type: "uint256",
        },
        {
          internalType: "uint160",
          name: "sqrtPriceLimitX96",
          type: "uint160",
        },
      ],
      name: "exactInputSingle",
      outputs: [
        { internalType: "uint256", name: "amountOut", type: "uint256" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const contract = new web3.eth.Contract(abiSwap, UNISWAP_V3_ROUTER);

  // Parameter transaksi sesuai dengan yang ditampilkan di MetaMask
  const params = {
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    fee: fee,
    recipient: account.address,
    deadline: Math.floor(Date.now() / 1000) + 1800, // Deadline 30 menit dari sekarang
    amountIn: amountIn,
    amountOutMinimum: amountOutMinimum, // Sesuaikan dengan hasil estimasi
    sqrtPriceLimitX96: "0", // Biasanya 0 jika tidak ada batasan harga
  };

  try {
    // Estimasi gas
    const gasEstimate = await contract.methods
      .exactInputSingle(params)
      .estimateGas({ from: account.address });

    // Kirim transaksi swap
    const data = contract.methods.exactInputSingle(params).encodeABI();
    const tx = {
      from: account.address,
      to: UNISWAP_V3_ROUTER,
      data: data,
      gas: Math.floor(Number(gasEstimate * 1.2)),
      nonce:
        Number(await web3.eth.getTransactionCount(account.address, "pending")) +
        1,
      gasPrice: Math.floor(
        Number(await web3.eth.getGasPrice()) * 1.1
      ).toString(),
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );
    console.log("Swap Success:", receipt.transactionHash);
    return { message: "Swap success", receipt };
  } catch (error) {
    console.error("Swap Failed:", error);
    return { message: "Swap failed", error };
  }
};

export default swap;
