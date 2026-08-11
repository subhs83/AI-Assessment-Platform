import os
import uuid
from pathlib import Path

import pdfplumber
from pdf2image import convert_from_path, convert_from_bytes
from PIL import Image as PILImage
from smart_exam_system.config import Config

class PageRenderer:
    """
    Renders original document pages and creates crops for
    figures, graphs, and images using AI-provided bounds.

    Gemini provides:
        page_number
        bounds

    This class creates:
        page image
        crop image
        crop_path
    """

    ASSET_TYPES = ("figures", "graphs", "images")

    def __init__(self, output_dir):
        self.output_dir = Path(output_dir)
        self.pages_dir = self.output_dir / "pages"
        self.crops_dir = self.output_dir / "crops"

        self.pages_dir.mkdir(parents=True, exist_ok=True)
        self.crops_dir.mkdir(parents=True, exist_ok=True)

    # ==========================================================
    # PUBLIC
    # ==========================================================

    def process(self, file_path, report):
        """
        Render pages and create asset crops.

        Args:
            file_path:
                Original PDF or image path.

            report:
                AnalysisReport dictionary.

        Returns:
            Updated report dictionary.
        """

        document_type = self._detect_document_type(file_path)

        if document_type == "pdf":
            page_images = self._render_pdf(file_path)
        else:
            page_images = self._load_image(file_path)

        self._create_crops(
            page_images=page_images,
            report=report,
        )

        return report

    # ==========================================================
    # DOCUMENT TYPE
    # ==========================================================

    @staticmethod
    def _detect_document_type(file_path):
        extension = Path(file_path).suffix.lower()

        if extension == ".pdf":
            return "pdf"

        return "image"

    # ==========================================================
    # PDF
    # ==========================================================

    def _render_pdf(self, file_path):
    

        pages = {}

        kwargs = {
            "dpi": Config.PDF_RENDER_DPI,
        }

        if Config.POPPLER_PATH:
            kwargs["poppler_path"] = Config.POPPLER_PATH

        rendered_pages = convert_from_path(
            file_path,
            **kwargs,
        )

        for page_number, image in enumerate(
            rendered_pages,
            start=1,
        ):
            print(
                f"PAGE {page_number} SIZE: "
                f"{image.width} x {image.height}"
            )
            pages[page_number] = image

            page_path = (
                self.pages_dir
                / f"page-{page_number}.png"
            )

            image.save(
                page_path,
                format="PNG",
            )

        return pages

    # ==========================================================
    # IMAGE
    # ==========================================================

    def _load_image(self, file_path):
        """
        Load an image document as page 1.
        """

        image = PILImage.open(file_path).convert("RGB")

        page_path = self.pages_dir / "page-1.png"

        image.save(
            page_path,
            format="PNG",
        )

        return {
            1: image,
        }

    # ==========================================================
    # CROPS
    # ==========================================================

    def _create_crops(self, page_images, report):
        """
        Create crops for figures, graphs and images.
        """

        assets = report.get("assets", {})
        pages = report.get("pages", [])

        # Create quick page lookup by page number
        page_dimensions = {
            page.get("page_number"): (
                page.get("width", 0),
                page.get("height", 0),
            )
            for page in pages
        }

        for asset_type in self.ASSET_TYPES:

            asset_list = assets.get(
                asset_type,
                [],
            )

            for asset in asset_list:

                page_number = asset.get(
                    "page_number"
                )

                page_image = page_images.get(
                    page_number
                )

                if page_image is None:
                    continue

                # --------------------------------------------------
                # Gemini page dimensions
                # --------------------------------------------------

                gemini_width, gemini_height = page_dimensions.get(
                    page_number,
                    (0, 0),
                )

                if gemini_width <= 0 or gemini_height <= 0:
                    continue

                # --------------------------------------------------
                # Convert Gemini bounds to actual page-image pixels
                # --------------------------------------------------
                print(
                    f"""    
                gemini_width: {gemini_width}
                gemini_height: {gemini_height}
                page_image.size: {page_image.size}
                """
                )
                bounds = self._convert_bounds(
                    asset.get("bounds", {}),
                    page_image,
                    gemini_width,
                    gemini_height,
                )
                print(
                    f"""    
                Converted bounds: {bounds}
                """ 
                )

                if not bounds:
                    continue

                # --------------------------------------------------
                # Crop
                # --------------------------------------------------

                crop = self._crop_asset(
                    page_image,
                    bounds,
                )

                if crop is None:
                    continue

                # --------------------------------------------------
                # Save crop
                # --------------------------------------------------

                crop_path = self._save_crop(
                    crop=crop,
                    asset=asset,
                    asset_type=asset_type,
                    page_number=page_number,
                )

                asset["crop_path"] = crop_path
    # ==========================================================
    # CROP
    # ==========================================================

    @staticmethod
    def _crop_asset(page_image, bounds):
        """
        Crop an asset from the original page image.

        Bounds are expected to be pixel coordinates:

            x
            y
            width
            height
        """

        if not isinstance(bounds, dict):
            return None

        try:
            x = int(bounds.get("x", 0))
            y = int(bounds.get("y", 0))
            width = int(bounds.get("width", 0))
            height = int(bounds.get("height", 0))
        except (TypeError, ValueError):
            return None

        if width <= 0 or height <= 0:
            return None

        page_width, page_height = page_image.size


        left = max(0, x)
        top = max(0, y)

        right = min(
            page_width,
            x + width,
        )

        bottom = min(
            page_height,
            y + height,
        )

        if right <= left or bottom <= top:
            return None

        return page_image.crop(
            (
                left,
                top,
                right,
                bottom,
            )
        )

    # ==========================================================
    # SAVE
    # ==========================================================

    def _save_crop(
        self,
        crop,
        asset,
        asset_type,
        page_number,
    ):
        """
        Save cropped asset and return its relative path.
        """

        asset_id = asset.get("id")

        if not asset_id:
            asset_id = uuid.uuid4().hex[:12]

        filename = (
            f"{asset_id}.png"
        )

        asset_dir = (
            self.crops_dir
            / asset_type
            / f"page-{page_number}"
        )

        asset_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        output_path = asset_dir / filename

        print(
            f"""
        SAVE CROP
        asset_id: {asset_id}
        asset_type: {asset_type}
        page: {page_number}
        output: {output_path}
        crop_size: {crop.size}
        """
        )

        crop.save(
            output_path,
            format="PNG",
        )
        return str(
            output_path.relative_to(
                self.output_dir
            )
        )


    @staticmethod
    def _convert_bounds(
        bounds,
        page_image,
        gemini_page_width,
        gemini_page_height,
    ):
        if not isinstance(bounds, dict):
            return None

        try:
            x = int(bounds.get("x", 0))
            y = int(bounds.get("y", 0))
            width = int(bounds.get("width", 0))
            height = int(bounds.get("height", 0))
        except (TypeError, ValueError):
            return None

        if gemini_page_width <= 0 or gemini_page_height <= 0:
            return None

        page_width, page_height = page_image.size

        scale_x = page_width / gemini_page_width
        scale_y = page_height / gemini_page_height

        return {
            "x": round(x * scale_x),
            "y": round(y * scale_y),
            "width": round(width * scale_x),
            "height": round(height * scale_y),
        }