// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title StreamReceiptNFT
/// @notice Simple ERC-721 receipt minted when a stream is created.
contract StreamReceiptNFT is ERC721, Ownable {
    uint256 public nextTokenId = 1;
    string private baseTokenURI;

    event ReceiptMinted(uint256 indexed tokenId, uint256 indexed streamId, address indexed recipient);

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    function setBaseTokenURI(string memory uri) external onlyOwner {
        baseTokenURI = uri;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function mintReceipt(address to, uint256 streamId) external onlyOwner returns (uint256 tokenId) {
        tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        emit ReceiptMinted(tokenId, streamId, to);
    }
}
